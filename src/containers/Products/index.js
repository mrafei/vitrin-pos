/* eslint-disable react/no-danger */
/**
 *
 * AdminOrder
 *
 */

import React, { memo, useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";
const { shell } = require("electron");
import Button from "@material-ui/core/esm/Button";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

import {
  makeSelectBusinessAddress,
  makeSelectCategories,
} from "../../../stores/business/selector";
import TextField from "@material-ui/core/esm/TextField";
import Icon from "../../components/Icon";
import { ICONS } from "../../../assets/images/icons";
import { useInjectReducer } from "../../../utils/injectReducer";
import reducer from "./reducer";
import { useInjectSaga } from "../../../utils/injectSaga";
import saga from "./saga";
import { getDeals, getUnavailableDeals } from "./actions";
import CategoryModal from "./CategoryModal";
import CategoriesList from "../../components/CategoriesList";
import CategoryPresentation from "../../components/CategoryPresentation";
import LoadingIndicator from "../../components/LoadingIndicator";
import {
  makeSelectFilteredDeals,
  makeSelectFilteredDealsPagination,
  makeSelectUnavailableDeals,
  makeSelectUnavailableDealsPagination,
} from "./selectors";
import { updateProduct } from "../../../stores/business/actions";
import Switch from "../../components/Swtich";
import { getQueryParams } from "../../../utils/helper";

export function Products({
  address,
  categories,
  _changeCategoryOrder,
  _updateProduct,
  history,
  deals,
  pagination,
  _getDeals,
  match: { params },
  _getUnavailableDeals,
  unavailableDeals,
  unavailableDealsPagination,
}) {
  useInjectReducer({ key: "products", reducer });
  useInjectSaga({ key: "products", saga });
  const [listView, setListView] = useState(
    !localStorage.getItem("productsCardView")
  );
  const [search, setSearch] = useState("");
  const [categoryModal, setCategoryModal] = useState(false);
  const [filters, setFilters] = useState({});
  const { id } = params;
  const category = categories.find((c) => c.id === +id) || {
    id: "all",
    name: "همه محصولات",
  };
  const reload = () => {
    const _categories = [];
    if (id !== "all") _categories.push(id);
    _getDeals({
      categories: _categories,
      filters: {
        ...filters,
        page: +getQueryParams("page", history.location.search) || 1,
      },
    });
    _getUnavailableDeals({
      categories: _categories,
      filters: {
        ...filters,
        page: +getQueryParams("unavailable_page", history.location.search) || 1,
        page_size: 10,
      },
    });
  };
  useEffect(reload, [
    filters,
    `${history.location.pathname}${history.location.search}`,
  ]);
  return (
    <div className="pb-5">
      <CategoryModal
        onClose={() => setCategoryModal(false)}
        isOpen={categoryModal}
      />
      <div className="u-border-radius-8 u-background-white container px-0 container-shadow overflow-hidden mt-5 p-3">
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <div
              className="d-flex u-cursor-pointer"
              onClick={() => {
                localStorage.setItem("productsCardView", "");
                setListView(true);
              }}
            >
              <Icon
                icon={ICONS.LIST_VIEW}
                className="ml-1"
                size={24}
                color={listView ? "#0050FF" : "#667e8a"}
              />
              <span
                className={`${
                  listView
                    ? "u-fontWeightBold u-text-primary-blue"
                    : "u-text-darkest-grey"
                }`}
              >
                لیست
              </span>
            </div>
            <div
              className="mr-3 d-flex u-cursor-pointer"
              onClick={() => {
                localStorage.setItem("productsCardView", "true");
                setListView(false);
              }}
            >
              <Icon
                icon={ICONS.CARD_VIEW}
                className="ml-1"
                size={24}
                color={!listView ? "#0050FF" : "#667e8a"}
              />
              <span
                className={`${
                  !listView
                    ? "u-fontWeightBold u-text-primary-blue"
                    : "u-text-darkest-grey"
                }`}
              >
                کارت
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <TextField
              onKeyDown={(e) => {
                if (e.keyCode === 13) setFilters({ search: search || null });
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              onClick={() => {
                setFilters({ ...filters, search: search || null });
              }}
              variant="contained"
              className="mr-3 px-1"
              disableElevation
              style={{ minWidth: 36 }}
            >
              <SearchRoundedIcon style={{ color: "white" }} />
            </Button>
          </div>
          <div className="d-flex">
            <div
              onClick={() => shell.openExternal(address)}
              className="ml-2 u-cursor-pointer u-background-green u-border-radius-4 d-inline-flex justify-content-center align-items-center pr-2 py-2 pl-3"
            >
              <Icon
                icon={ICONS.WEBSITE}
                color="white"
                className="ml-2"
                size={18}
              />
              <span className="u-fontWeightBold u-fontMedium u-text-white">
                دیدن سایت
              </span>
            </div>

            <div
              onClick={() => setCategoryModal(true)}
              className="u-cursor-pointer u-background-primary-blue u-border-radius-4 d-inline-flex justify-content-center align-items-center pr-2 py-2 pl-3"
            >
              <Icon
                icon={ICONS.PLUS}
                color="white"
                className="ml-2"
                size={12}
              />
              <span className="u-fontWeightBold u-fontMedium u-text-white">
                افزودن دسته‌بندی جدید
              </span>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center my-1">
          <div className="d-flex align-items-center">
            <Switch
              isSwitchOn={filters.is_discounted}
              toggleSwitch={(is_discounted) => {
                history.replace(
                  setFilters({
                    ...filters,
                    is_discounted: Boolean(is_discounted) || null,
                  })
                );
              }}
            />
            <div className="mr-2">فقط محصولات تخفیف‌دار</div>
          </div>
        </div>
        <CategoriesList
          categories={categories}
          selectedId={id}
          onItemClick={(category) => {
            if (category) history.push(`/categories/${category.id}`);
            else history.push(`/categories`);
          }}
        />
      </div>
      {category && unavailableDeals ? (
        unavailableDeals.length ? (
          <CategoryPresentation
            backgroundColor="#E0E5E8"
            category={{ name: "محصولات ناموجود", deals: unavailableDeals }}
            history={history}
            categories={categories}
            themeColor="#0050ff"
            isList={listView}
            onCategoryEditButtonClick={(_category) => {}}
            onNewProductCardClick={() =>
              history.push(`/products/new/${category.id}`)
            }
            productCardOptions={{
              onClick: (product) => history.push(`/products/${product.id}`),
              _updateProduct,
              _updateCallback: reload,
            }}
            keyword="unavailable_page"
            pagination={unavailableDealsPagination}
          />
        ) : null
      ) : (
        <LoadingIndicator />
      )}
      {category && deals ? (
        <CategoryPresentation
          pagination={pagination}
          category={{ ...category, deals }}
          history={history}
          categories={categories}
          themeColor="#0050ff"
          isEditMode={category.id !== "all"}
          isList={listView}
          onCategoryEditButtonClick={(_category) => {}}
          onNewProductCardClick={() =>
            history.push(`/products/new/${category.id}`)
          }
          productCardOptions={{
            onClick: (product) => history.push(`/products/${product.id}`),
            _updateProduct,
            _updateCallback: reload,
          }}
        />
      ) : (
        <LoadingIndicator />
      )}
    </div>
  );
}

const mapStateToProps = createStructuredSelector({
  address: makeSelectBusinessAddress(),
  categories: makeSelectCategories(),
  deals: makeSelectFilteredDeals(),
  unavailableDeals: makeSelectUnavailableDeals(),
  pagination: makeSelectFilteredDealsPagination(),
  unavailableDealsPagination: makeSelectUnavailableDealsPagination(),
});

function mapDispatchToProps(dispatch) {
  return {
    _getDeals: (data) => dispatch(getDeals(data)),
    _getUnavailableDeals: (data) => dispatch(getUnavailableDeals(data)),
    _updateProduct: (productId, product, uploadedFiles,  callback) =>
      dispatch(
        updateProduct(productId, product, uploadedFiles, callback)
      ),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(memo, withRouter, withConnect)(Products);
