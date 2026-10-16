'use strict';

/**
 * Custom SCAPI implementation for share-cart.
 *
 * Endpoints:
 *   POST /baskets/{basketId}/share  → createShareToken
 *   GET  /share/{shareToken}        → getSharedCart
 *
 * Share tokens are stored as Custom Objects (type: ShareCart, key: token).
 * Each record holds the basketId, siteId, and expiry time.
 */

var RESTResponseMgr  = require('dw/system/RESTResponseMgr');
var CustomObjectMgr  = require('dw/object/CustomObjectMgr');
var BasketMgr        = require('dw/order/BasketMgr');
var UUIDUtils        = require('dw/util/UUIDUtils');
var Calendar         = require('dw/util/Calendar');
var Transaction      = require('dw/system/Transaction');

var TOKEN_TTL_HOURS  = 72;
var CO_TYPE          = 'ShareCart';

/**
 * POST /baskets/{basketId}/share
 * Creates a share token for the given basket and stores it as a Custom Object.
 */
exports.createShareToken = function () {
    var basketId   = request.getSCAPIPathParameters().get('basketId');
    var siteId     = request.httpParameterMap.get('siteId').stringValue;

    var basket = BasketMgr.getBasket(basketId);
    if (!basket) {
        RESTResponseMgr
            .createError(404, 'basket-not-found', 'Basket Not Found',
                'No basket found with id: ' + basketId)
            .render();
        return;
    }

    var token     = UUIDUtils.createUUID();
    var expiresAt = new Calendar();
    expiresAt.add(Calendar.HOUR, TOKEN_TTL_HOURS);

    Transaction.wrap(function () {
        var co = CustomObjectMgr.createCustomObject(CO_TYPE, token);
        co.custom.basketId  = basketId;
        co.custom.siteId    = siteId;
        co.custom.expiresAt = expiresAt.time;
    });

    var shareUrl = 'https://' + request.httpHost + '/on/demandware.store/' + siteId + '/default/Cart-LoadShared?token=' + token;

    RESTResponseMgr
        .createSuccess({
            shareToken: token,
            shareUrl:   shareUrl,
            expiresAt:  expiresAt.time.toISOString()
        })
        .render();
};
exports.createShareToken.public = true;

/**
 * GET /share/{shareToken}
 * Retrieves basket contents for a valid, non-expired share token.
 */
exports.getSharedCart = function () {
    var shareToken = request.getSCAPIPathParameters().get('shareToken');

    var co = CustomObjectMgr.getCustomObject(CO_TYPE, shareToken);
    if (!co) {
        RESTResponseMgr
            .createError(404, 'token-not-found', 'Token Not Found',
                'No share token found: ' + shareToken)
            .render();
        return;
    }

    var now = new Date();
    if (co.custom.expiresAt && co.custom.expiresAt < now) {
        RESTResponseMgr
            .createError(410, 'token-expired', 'Token Expired',
                'This share link has expired.')
            .render();
        return;
    }

    var basket = BasketMgr.getBasket(co.custom.basketId);
    if (!basket) {
        RESTResponseMgr
            .createError(404, 'basket-not-found', 'Basket Not Found',
                'The original basket no longer exists.')
            .render();
        return;
    }

    var productItems = [];
    var items = basket.getProductLineItems().iterator();
    while (items.hasNext()) {
        var item = items.next();
        productItems.push({
            productId:   item.productID,
            productName: item.productName,
            quantity:    item.quantityValue,
            price:       item.adjustedNetPrice ? item.adjustedNetPrice.value : 0
        });
    }

    RESTResponseMgr
        .createSuccess({
            basketId:     basket.UUID,
            productItems: productItems
        })
        .render();
};
exports.getSharedCart.public = true;
