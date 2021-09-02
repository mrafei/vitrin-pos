import request from "../../utils/request";
import {
  getHamiCustomersApi,
  getHamiDealCategoriesApi,
  getHamiDealItemApi,
  getHamiOrdersApi,
  getHamiToppingsApi,
  submitHamiOrderApi,
} from "./api";
import moment from "moment-jalaali";
import {
  UPDATE_DEVICE_API,
  UPSERT_CATEGORIES_API,
  UPSERT_CRM_MEMBERSHIP_API,
  UPSERT_DEALS_API,
  UPSERT_MODIFIERS_API,
  UPSERT_POS_ORDERS_API,
  UPSERT_USER_ADDRESS_API,
} from "../../utils/api";
import { persianToEnglishNumber } from "../../utils/helper";

export const init = () => {};

export const submitHamiOrder = (order) => {
  const orderDateObject = new Date(order.submitted_at);
  const orderDate = moment(order.submitted_at).format("jYYYY/jMM/jDD");
  const orderTime = `${`0${orderDateObject.getHours()}`.slice(
    -2
  )}:${`0${orderDateObject.getMinutes()}`.slice(
    -2
  )}:${`0${orderDateObject.getSeconds()}`.slice(-2)}`;

  request(
    `${submitHamiOrderApi(localStorage.getItem("hamiIp"))}${
      localStorage.getItem("hamiSecurityKey")
        ? `?securityKey=${localStorage.getItem("hamiSecurityKey")}`
        : ""
    }`,
    {
      Invoice: {
        OrderId: parseInt(order.order_id),
        BranchId: 1,
        OrderDate: orderDate,
        OrderTime: orderTime,
        CustomerCode: `${order.user_id}`,
        FirstName: order.user_address.name,
        LastName: "",
        Phone: order.user_address.phone,
        CellPhone: order.user_address.phone,
        LocationId: 0,
        DeliveryAddress: order.user_address.address,
        Comments: order.description,
        OrderType: 1,
        Price: order.total_items_price,
        DeliveryPrice: order.delivery_price,
        PackingPrice: order.total_packaging_price,
        Discount: order.total_discount,
        Tax: order.taxing_price,
        Duty: 0,
        Addition: 0,
        Rounded: 0,
        Payable: order.final_price,
        Remaining: 0,
        CommissionPrice: 0,
        PaymentTypeId: parseInt(order.payment_status) === 1 ? 1 : 3,
        DiscountCode: "",
        Latitude: `${order.user_address.latitude}`,
        Longitude: `${order.user_address.longitude}`,
        Items: order.items.map((item) => ({
          OrderItemId: parseInt(`${order.order_id}000${item.deal.pos_id}`),
          OrderId: parseInt(order.order_id),
          ProductId: parseInt(item.deal.pos_id),
          ProductCode: parseInt(item.deal.pos_code),
          ProductTitle: item.deal.title,
          ProductPrice: item.deal.initial_price,
          Quantity: item.amount,
          DescriptionPrice: 0,
          SumPrice: item.deal.initial_price,
          ProductDiscount: item.deal.initial_price - item.deal.discounted_price,
          Addition: 0,
          ProductTax: 0,
          ProductDuty: 0,
          TotalPrice: item.deal.discounted_price,
          Description: "",
        })),
        ItemsTopping: [],
      },
    },
    "POST"
  );
};
export const getHamiDeals = async () => {
  return await request(getHamiDealItemApi(localStorage.getItem("hamiIp")), {
    securityKey: localStorage.getItem("hamiSecurityKey"),
  });
};
export const getHamiDealCategories = async () => {
  return await request(
    getHamiDealCategoriesApi(localStorage.getItem("hamiIp")),
    {
      securityKey: localStorage.getItem("hamiSecurityKey"),
    }
  );
};
export const getHamiToppings = async () => {
  return await request(getHamiToppingsApi(localStorage.getItem("hamiIp")), {
    securityKey: localStorage.getItem("hamiSecurityKey"),
  });
};

export const createOrUpdateHamiModifiers = async (businessId) => {
  const result = await getHamiToppings();
  if (!result || !result.response) return null;

  return await request(
    UPSERT_MODIFIERS_API,
    result.response["ToppingGoods"].map((modifierSet) => ({
      pos_id: modifierSet.GroupId,
      // extra_data: { pos_code: category.GroupCode },
      name: category.GroupName,
      business: businessId,
    })),
    "POST"
  );
};
export const createOrUpdateHamiDealCategories = async (businessId) => {
  const result = await getHamiDealCategories();
  if (!result || !result.response) return null;

  return await request(
    UPSERT_CATEGORIES_API,
    result.response["GoodsGroup"].map((category) => ({
      pos_id: category.GroupId,
      // extra_data: { pos_code: category.GroupCode },
      name: category.GroupName,
      business: businessId,
    })),
    "POST"
  );
};
export const createOrUpdateHamiDeals = async (categories, businessId) => {
  const result = await getHamiDeals();
  if (!result || !result.response) return null;

  return await request(
    UPSERT_DEALS_API,
    result.response["Goods"].map((deal) => ({
      pos_id: deal.GoodsId,
      pos_code: deal.GoodsCode,
      title: deal.GoodsName,
      description: deal.GoodsDescription,
      discounted_price: deal.GoodsPrice,
      initial_price: deal.GoodsPrice,
      packaging_price: deal.PackingPrice || 0,
      categories:
        categories &&
        categories.find(
          (cat) => parseInt(cat.pos_id) === parseInt(deal.GoodsGroupId)
        )
          ? [
              parseInt(
                categories.find(
                  (cat) => parseInt(cat.pos_id) === parseInt(deal.GoodsGroupId)
                ).id
              ),
            ]
          : [],
      _business: businessId,
    })),
    "POST"
  );
};
export const createOrUpdateDealsAndCategories = async (businessId) => {
  const categoriesResult = await createOrUpdateHamiDealCategories(businessId);
  if (!categoriesResult.response || !categoriesResult.response.data)
    return null;
  const dealsResult = await createOrUpdateHamiDeals(
    categoriesResult.response.data,
    businessId
  );
  // const modifiersResult = await createOrUpdateHamiModifiers(
  //   categoriesResult.data,
  //   businessId
  // );
  return dealsResult.response && dealsResult.response.data;
};

export const createOrUpdateHamiCRMMemberships = async (
  businessId,
  fromTime,
  toTime,
  CreationTimeStart = "00:00:00",
  CreationTimeEnd = "24:00:00"
) => {
  const memberships = [];
  const addresses = [];
  const result = await request(
    getHamiCustomersApi(localStorage.getItem("hamiIp")),
    {
      securityKey: localStorage.getItem("hamiSecurityKey"),
      CreationDateStart: fromTime,
      CreationDateEnd: toTime,
      CreationTimeStart,
      CreationTimeEnd,
    }
  );
  if (!result || !result.response) return null;

  if (!result.response.length) return true;
  result.response.map((user) => {
    user.MApiCustomerPhoness.map((memberItem) =>
      memberships.push({
        pos_id: user.PartyId,
        name: user.FirstName + " " + user.LastName,
        phone: persianToEnglishNumber(memberItem.PhoneNumber),
        business: businessId,
        extra_phones: user.MApiCustomerPhoness.map((item) =>
          persianToEnglishNumber(item.PhoneNumber)
        ),
      })
    );
    user.MApiCustomerAddresss.map((addressItem) =>
      addresses.push({
        // pos_id: addressItem.LocationId,
        name: user.FirstName + " " + user.LastName,
        latitude: addressItem.latitude,
        longitude: addressItem.longitude,
        address: addressItem.Address,
        phone: persianToEnglishNumber(
          user.MApiCustomerPhoness && user.MApiCustomerPhoness.length
            ? user.MApiCustomerPhoness[0].PhoneNumber
            : ""
        ),
        business: businessId,
      })
    );
  });
  const uniqueArray = memberships.filter(function (item, pos) {
    return memberships.findIndex((i) => i.phone === item.phone) === pos;
  });
  const membershipsResult = await request(
    UPSERT_CRM_MEMBERSHIP_API,
    uniqueArray,
    "POST"
  );
  const addressesResult = addresses.length
    ? await request(UPSERT_USER_ADDRESS_API, addresses, "POST")
    : { response: { data: [] } };
  return (
    membershipsResult.response &&
    membershipsResult.response.data &&
    addressesResult.response &&
    addressesResult.response.data
  );
};

export const createOrUpdateHamiOrders = async (
  businessId,
  userId,
  fromTime,
  toTime,
  InvoiceTimeStart = "00:00:00",
  InvoiceTimeEnd = "24:00:00"
) => {
  const result = await request(
    getHamiOrdersApi(localStorage.getItem("hamiIp")),
    {
      securityKey: localStorage.getItem("hamiSecurityKey"),
      InvoiceDateStart: fromTime,
      InvoiceDateEnd: toTime,
      InvoiceTimeStart,
      InvoiceTimeEnd,
    }
  );
  if (!result || !result.response) return null;

  if (!result.response.length) return true;
  const orders = result.response
    .filter((order) => !order.Description.includes("وب سایت"))
    .map((order) => ({
      business_id: businessId,
      pos_id: order.SaleInvoiceId,
      order_items: order.MApiInvoiceItems.map((orderItem) => ({
        amount: orderItem.GoodsCount,
        deal_pos_id: orderItem.GoodsId,
        deal_id: null,
        initial_price: orderItem.GoodsPrice,
        discounted_price:
          orderItem.GoodsPrice - orderItem.SumDiscount / orderItem.GoodsCount,
        final_unit_cost: orderItem.GoodsPrice,
        packaging_price: 0,
      })),
      order_number: order.SaleInvoiceNumber,
      order_status: 1,
      user_address: {
        name: order.PartyName,
        address: order.PartyAddress,
        phone: order.PartyPhone,
      },
      user_phone_number: order.PartyPhone,
      delivery_site_type:
        order.SaleInvoiceTypeTitle === "مشترکین"
          ? "delivery_on_business_site"
          : "delivery_on_user_site",
      payments: [],
      sales_channel: 1,
      created_at: moment(
        `${order.InvoiceDate} ${order.InvoiceTime}`,
        "jYYYY/jMM/jDD HH:mm:ss"
      ).format("YYYY-MM-DD"),
      submitted_at: moment(
        `${order.InvoiceDate} ${order.InvoiceTime}`,
        "jYYYY/jMM/jDD HH:mm:ss"
      ).format("YYYY-MM-DD"),
      pos_user_id: userId,
      _delivery_price: order.DeliveryPrice,
      pos_device_id: 0,
      final_price: order.Payable,
      _taxing_price: order.SumTax,
      description: order.description,
      total_discount: order.SumDiscount,
      total_items_price: order.SumSell,
      _total_packaging_price: 0,
      payment_type: "onsite",
      payment_status: 2,
      archived: localStorage.getItem("hamiKeepTracking") === "true",
    }));
  const ordersResult = await request(UPSERT_POS_ORDERS_API, orders, "POST");
  if (
    ordersResult.response &&
    ordersResult.response.data &&
    localStorage.getItem("hamiSecurityKey")
  )
    await request(
      UPDATE_DEVICE_API(localStorage.getItem("hamiSecurityKey")),
      {
        extra_data: {
          initial_orders_date: moment(
            `${toTime} ${InvoiceTimeEnd}`,
            "jYYYY/jMM/jDD HH:mm:ss"
          ).unix(),
        },
      },
      "PATCH"
    );
  return ordersResult.response && ordersResult.response.data;
};
