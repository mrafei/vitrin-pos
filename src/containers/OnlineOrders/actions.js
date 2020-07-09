/*
 *
 * Admin actions
 *
 */

import { SET_FOOD_ADMIN_ORDERS, DEFAULT_ACTION, GET_FOOD_ADMIN_ORDERS } from "./constants";

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function getFoodAdminOrders(page) {
  return {
    type: GET_FOOD_ADMIN_ORDERS,
    data: page,
  };
}

export function setFoodAdminOrders(data, pagination) {
  return {
    type: SET_FOOD_ADMIN_ORDERS,
    data,
    pagination,
  };
}
