import React from "react";
import PropTypes from "prop-types";
import {
  englishNumberToPersianNumber,
  priceFormatter,
} from "../../../utils/helper";
import moment from "moment-jalaali";
import QRCode from "qrcode.react";

export default class ComponentToPrint extends React.Component {
  render() {
    const { order, business, printOptions = {}, size } = this.props;
    const isLarge = size === "۸ سانتی‌متری";
    let cost = "رایگان";
    if (+order.delivery_price === 999999) cost = "خارج از محدوده ارسال";
    else if (+order.delivery_price !== 0)
      cost = ` ${priceFormatter(+order.delivery_price)} تومان `;
    const {
      revised_title: title,
      get_vitrin_absolute_url: url,
      phone_zero_starts: phone,
    } = business;
    const date = moment(order.submitted_at).format("jYYYY/jMM/jDD - HH:mm:ss");
    const sortedItems = [...order.items];
    sortedItems.sort((a, b) => {
      let firstTotal = a.deal.discounted_price;
      let secondTotal = b.deal.discounted_price;
      if (a.deal.modifiers)
        for (let i = 0; i < a.deal.modifiers.length; i += 1)
          firstTotal += a.deal.modifiers[i].price;
      if (b.deal.modifiers)
        for (let j = 0; j < b.deal.modifiers.length; j += 1)
          secondTotal += b.deal.modifiers[j].price;
      if (firstTotal > secondTotal) return -1;
      if (firstTotal < secondTotal) return 1;
      return 0;
    });
    const pelateChar = order?.user_address?.extra_data?.plate_number?.replace(
      /[0-9]/g,
      ""
    );
    const plateNums = order?.user_address?.extra_data?.plate_number?.replace(
      pelateChar,
      ""
    );
    let finalCost = order.final_price;
    if (order.wallet_credit_used) finalCost = order.should_pay;

    return (
      <div
        className="bg-white u-text-black w-100 printable px-3"
        style={{
          width: isLarge ? "100%" : "calc(100% - 60px)",
          marginRight: isLarge ? 0 : 30,
          minWidth: 300,
          fontSize: isLarge ? 14 : 12,
        }}
      >
        <div className="py-1 px-2 u-border-bottom-dark">
          <div className="d-flex justify-content-between align-items-center">
            <span
              className="d-flex px-1 py-2 flex-column justify-content-center align-items-center"
              style={{
                border: "1px solid black",
                height: "fit-content",
                borderRadius: 4,
              }}
            >
              <span
                className="text-center"
                style={{ fontSize: isLarge ? 12 : 10, whiteSpace: "nowrap" }}
              >
                شماره فاکتور
              </span>
              <span
                style={{ fontSize: isLarge ? 18 : 16 }}
                className="u-fontWeightBold"
              >
                {englishNumberToPersianNumber(order.order_number) || "۱۰۱"}
              </span>
            </span>
            {!printOptions.hideTitle && (
              <div
                className="text-center u-fontWeightBold"
                style={{ width: 160, fontSize: isLarge ? 18 : 16 }}
              >
                {title}
              </div>
            )}
            {!printOptions.hideQR && <QRCode value={url} size={100} id="qr" />}
          </div>
        </div>
        <div className="d-flex flex-column justify-content-between px-3 pb-1">
          <div className="mt-1">
            <span>تاریخ و ساعت: </span>
            <span className="u-fontWeightBold">
              {englishNumberToPersianNumber(date)}
            </span>
          </div>

          {!printOptions.hideCustomerName && (
            <div className="mt-1">
              <span> مشترک گرامی: </span>
              {order.user_address && (
                <span className="u-fontWeightBold">
                  {order.user_address.name}
                </span>
              )}
            </div>
          )}

          {!printOptions.hideOrderNumber && (
            <div className="mt-1">
              <span>شماره سفارش: </span>
              <span className="u-fontWeightBold">{order.order_id}</span>
            </div>
          )}
          {!printOptions.hideCustomerAddress && (
            <div className="mt-1">
              <span> آدرس سفارش دهنده: </span>
              {order.delivery_on_site ? (
                <span
                  style={{ fontSize: isLarge ? 18 : 16 }}
                  className="u-fontWeightBold"
                >
                  {order.delivery_site_type === "delivery_on_car"
                    ? "تحویل در ماشین"
                    : `تحویل در محل ${business.revised_title}`}
                </span>
              ) : null}
              {order.user_address && !order.delivery_on_site ? (
                <span
                  style={{ fontSize: isLarge ? 18 : 16 }}
                  className="u-fontWeightBold"
                >
                  {order.user_address.address}
                </span>
              ) : null}
            </div>
          )}
          {!printOptions.hideCustomerPhone && (
            <div className="mt-1">
              <span>تلفن: </span>
              {order.user_address && (
                <span className="u-fontWeightBold">
                  {order.user_address.phone}
                </span>
              )}
            </div>
          )}

          {!printOptions.hideDetails && (
            <div className="mt-1">
              <span>جزئیات ارسال: </span>
              <span
                className="u-fontWeightBold"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {(order && order.description) || "ندارد"}
              </span>
            </div>
          )}
          {order.delivery_on_site ? (
            <div className="mt-1">
              <span
                className="u-fontWeightBold"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {order.is_carry_out_order
                  ? "سفارش بیرون بر - بسته‌بندی شود."
                  : "میل در سالن"}
              </span>
            </div>
          ) : null}
          {order?.delivery_site_type?.toUpperCase() === "DELIVERY_ON_CAR" &&
            (order?.user_address?.extra_data?.model_name ||
              order?.user_address?.extra_data?.color ||
              order?.user_address?.extra_data?.plate_number) && (
              <div className="mt-3">
                <div className="u-textBlack" style={{ fontWeight: 500 }}>
                  اطلاعات خودرو
                </div>
                <div className="row d-flex align-items-center">
                  {order?.user_address?.extra_data?.model_name && (
                    <div className="text-nowrap">
                      مدل: {order?.user_address?.extra_data?.model_name}
                    </div>
                  )}
                  {order?.user_address?.extra_data?.color && (
                    <div className="mr-4">
                      رنگ:{order?.user_address?.extra_data?.color}
                    </div>
                  )}
                  {order?.user_address?.extra_data?.plate_number && (
                    <div className="d-flex align-items-center mr-4 mb-3">
                      <span>پلاک: </span>
                      <div
                        className="d-flex mx-1"
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <div
                          className="d-flex justify-content-center py-1 px-3 position-relative"
                          style={{
                            border: "1px solid gray",
                          }}
                        >
                          <span
                            className="position-absolute"
                            style={{ top: 0 }}
                          >
                            ایران
                          </span>
                          <span className="ml-2 pt-3">
                            {plateNums?.slice(5)}
                          </span>
                        </div>
                        <div
                          className="py-1 pt-3 px-3"
                          style={{
                            border: "1px solid gray",
                          }}
                        >
                          <span className="ml-2">{plateNums?.slice(2, 5)}</span>
                          <span className="ml-2">{pelateChar}</span>
                          <span>{plateNums?.slice(0, 2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {!printOptions.hideItems && (
          <div>
            <div className="pt-1">
              <div className="d-flex flex-row px-2 mt-1 u-border-bottom-dark py-1">
                <div
                  style={{
                    width: !printOptions.hideItemPrices ? 160 : 320,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  نام
                </div>

                <div className="text-center" style={{ width: 35 }}>
                  تعداد
                </div>

                {!printOptions.hideItemPrices ? (
                  <>
                    <div className="text-center" style={{ width: 80 }}>
                      فی
                    </div>

                    <div className="text-center" style={{ width: 80 }}>
                      قیمت کل
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            {sortedItems.map((item) => (
              <>
                <div
                  className={`d-flex flex-row px-2 ${
                    item.deal.modifiers && item.deal.modifiers.length
                      ? "pt-1"
                      : "u-border-bottom-dark py-1"
                  }`}
                  key={`order-item-${item.id}`}
                >
                  <div
                    className="u-fontWeightBold"
                    style={{
                      fontSize: isLarge ? 18 : 16,
                      width: !printOptions.hideItemPrices ? 160 : 320,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {item.deal.title}{" "}
                    {item.deal.variation_name &&
                      `(${item.deal.variation_name})`}
                  </div>
                  <div
                    className="text-center u-fontWeightBold"
                    style={{ fontSize: isLarge ? 18 : 16, width: 35 }}
                  >
                    {englishNumberToPersianNumber(item.amount)}
                  </div>

                  {!printOptions.hideItemPrices ? (
                    <>
                      <div className="text-center" style={{ width: 80 }}>
                        {priceFormatter(item.deal.discounted_price)}
                      </div>
                      <div className="text-center" style={{ width: 80 }}>
                        {priceFormatter(
                          item.deal.discounted_price * item.amount
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
                {item.deal.modifiers && item.deal.modifiers.length
                  ? item.deal.modifiers.map((_item) => (
                      <div
                        className="d-flex flex-row px-2 pb-1 u-border-bottom-dark"
                        key={`order-item-${_item.id}`}
                      >
                        <div
                          className=""
                          style={{
                            width: !printOptions.hideItemPrices ? 160 : 320,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {_item.title}
                        </div>
                        <div className="text-center" style={{ width: 35 }}>
                          {englishNumberToPersianNumber(item.amount)}
                        </div>
                        {!printOptions.hideItemPrices ? (
                          <>
                            <div className="text-center" style={{ width: 80 }}>
                              {priceFormatter(_item.price)}
                            </div>
                            <div className="text-center" style={{ width: 80 }}>
                              {priceFormatter(_item.price * item.amount)}
                            </div>
                          </>
                        ) : null}
                      </div>
                    ))
                  : null}
              </>
            ))}
          </div>
        )}
        {!printOptions.hidePrices && (
          <div className="d-flex flex-column justify-content-between px-3 pb-1 u-border-bottom-dark">
            <div className="mt-1">
              <span>قیمت اولیه: </span>
              <span
                className="u-fontWeightBold"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {priceFormatter(order.total_initial_price)} تومان
              </span>
            </div>
            {order.total_discount_amount ? (
              <div className="mt-1">
                <span>مجموع تخفیف‌ها و اعتبار هدیه: </span>
                <span
                  className="u-fontWeightBold"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {priceFormatter(order.total_discount_amount)}
                  <span className="mx-1">-</span>
                  <span>تومان</span>
                </span>
              </div>
            ) : null}
            {order.gift_credit_used ? (
              <div className="mt-1">
                <span>اعتبار هدیه : </span>
                <span
                  className="u-fontWeightBold"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {priceFormatter(order.gift_credit_used)}
                  <span className="mx-1">-</span>
                  <span>تومان</span>
                </span>
              </div>
            ) : null}
            {order.discount_code_amount ? (
              <div className="mt-1">
                <span>کد تخفیف: </span>
                <span
                  className="u-fontWeightBold"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {priceFormatter(order.discount_code_amount)}
                  <span className="mx-1">-</span>
                  <span>تومان</span>
                </span>
              </div>
            ) : null}
            {order.total_packaging_price ? (
              <div className="mt-1">
                <span>هزینه بسته‌بندی: </span>
                <span
                  className="u-fontWeightBold"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {priceFormatter(order.total_packaging_price)} تومان
                </span>
              </div>
            ) : null}

            <div className="mt-1">
              <span>هزینه ارسال: </span>
              <span className="u-fontWeightBold">{cost}</span>
            </div>
            {order.taxing_price ? (
              <div className="mt-1">
                <span>مالیات بر ارزش افزوده: </span>
                <span
                  className="u-fontWeightBold"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {priceFormatter(order.taxing_price)} تومان
                </span>
              </div>
            ) : null}
            {order.wallet_credit_used ? (
              <>
                <div className="mt-1">
                  <span>مبلغ قابل پرداخت: </span>
                  <span
                    className="u-fontWeightBold"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {priceFormatter(order.final_price)} تومان
                  </span>
                </div>
                <div className="mt-1">
                  <span>مبلغ پرداختی از کیف پول: </span>
                  <span
                    className="u-fontWeightBold"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {priceFormatter(order.wallet_credit_used)}
                    <span className="mx-1">-</span>
                    <span>تومان</span>
                  </span>
                </div>
              </>
            ) : null}
            <div className="mt-1">
              <span>
                {order.wallet_credit_used
                  ? "باقیمانده جهت پرداخت:"
                  : "مبلغ قابل پرداخت:"}{" "}
              </span>
              <span
                className="u-fontWeightBold px-3 py-1 u-fontLarge u-background-black u-text-white"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {priceFormatter(finalCost)} تومان
              </span>
            </div>
            <span className="u-fontWeightBold mt-2">
              {order.finalCost === 0
                ? "اعتبار هدیه"
                : order.payment_status === 1
                ? "آنلاین"
                : "نقدی"}
            </span>
          </div>
        )}

        {!printOptions.hidePhone && (
          <div className="mt-1 px-3">
            <span>{title}: </span>
            <span className="u-fontWeightBold">{phone}</span>
          </div>
        )}
        <div className="mt-1 px-3">
          <span>{url}</span>
        </div>
      </div>
    );
  }
}
ComponentToPrint.propTypes = {
  order: PropTypes.object.isRequired,
  business: PropTypes.object.isRequired,
};
