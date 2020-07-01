import React from 'react';
import Map from '../../../components/Map';
import { englishNumberToPersianNumber } from "../../../../utils/helper";
import moment from "moment-jalaali";

function DeliverySection({order}) {
  const mapOptions = {
    height: 150,
    width: 150,
    center: {
      longitude: order.user_address ? order.user_address.longitude : null,
      latitude: order.user_address ? order.user_address.latitude : null
    },
    markers: [
      {
        longitude: order.user_address ? order.user_address.longitude : null,
        latitude: order.user_address ? order.user_address.latitude : null,
        singleMarker: true
      }
    ],
    style: {
      margin: 0,
    }
  };
  const orderDate = new Date(order.submitted_at);
  const orderTime = moment(
    `${orderDate.getFullYear()}-${orderDate.getMonth() +
    1}-${orderDate.getDate()}`,
    'YYYY-MM-DD'
  );
  return (
    <div className="w-100 py-2 u-background-white mt-1 px-3">
      <div className="flex-1 u-fontWeightBold mb-2 u-text-black">جزئیات ارسال</div>
      <div className="d-flex justify-content-between flex-wrap px-3">
        <div className="ml-4 mb-2" style={{ maxWidth: "70%" }}>
          <div className="mt-1">
            <span className="u-textBlack">ساعت و تاریخ: </span>
            <span className="d-inline-flex align-items-center">
              <span>
                {englishNumberToPersianNumber(
                  `${`0${orderDate.getHours()}`.slice(
                    -2
                  )}:${`0${orderDate.getMinutes()}`.slice(-2)}`
                )}
              </span>
              <div
                style={{width: 2, height: 15}}
                className="mx-2 u-background-dark-grey"
              />
              <span>
                {englishNumberToPersianNumber(
                  orderTime.format('jYYYY/jMM/jDD')
                )}
              </span>
            </span>
          </div>
          <div className="mt-2">
            <span className="u-textBlack">شماره تماس: </span>
            {order.user_address && (
              <span className="u-text-darkest-grey">{englishNumberToPersianNumber(order.user_address.phone)}</span>
            )}
          </div>
          <div className="mt-2">
            <span className="u-textBlack"> نام سفارش دهنده: </span>
            {order.user_address && (
              <span className="u-text-darkest-grey">{order.user_address.name}</span>
            )}
          </div>
          <div className="mt-2">
            <span className="u-textBlack"> آدرس سفارش دهنده: </span>
            {order.delivery_on_site && (
              <span className="u-text-darkest-grey">تحویل در محل رستوران</span>
            )}
            {order.user_address && !order.delivery_on_site ? (
              <span className="u-text-darkest-grey">{order.user_address.address}</span>
            ) : null}
          </div>
          <div className="mt-2">
            <span className="u-textBlack">جزئیات ارسال:</span>
            <span className="u-text-darkest-grey pr-1" style={{ whiteSpace: "pre-wrap" }}>
              {(order && order.description) || "ندارد"}
            </span>
          </div>
        </div>
        <Map options={mapOptions} />
      </div>
    </div>
  );

}

export default DeliverySection;
