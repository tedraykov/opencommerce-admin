import { useState, useMemo, useCallback, FC, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { CellProps, Column } from "react-table";
import { useSnackbar } from "notistack";
import { Button, Card, CardContent, Box, Typography } from "@mui/material";

import { useAuth, useShop } from "platform/hooks";
import { Resetable, SelectColumnFilter, Table } from "ui";
import productsQuery from "../graphql/queries/products";
import createProductMutation from "../graphql/mutations/createProduct";
import { Product, ProductConnection, QueryProductsArgs } from "platform/types/gql-types";
import MediaCell from "./DataTable/MediaCell";
import PublishedStatusCell from "./DataTable/PublishedStatusCell";
import StatusIconCell from "./DataTable/StatusIconCell";

const ProductsTable: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentShop } = useShop();
  const {viewer} = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [getProducts] =
    useLazyQuery<{ products: ProductConnection }, Partial<QueryProductsArgs>>(productsQuery);
  const [
    createProduct,
    { error: createProductError }
  ] = useMutation(createProductMutation);

  const tableRef = useRef<Resetable>(null);

  // Create and memoize the column data
  const columns = useMemo<Column<Product>[]>(() => [
    {
      Header: "",
      Cell: ({ row }: CellProps<Product, string>) => <MediaCell row={row} />,
      id: "thumbnailURL"
    },
    {
      Header: t("admin.productTable.header.product", "Product")!,
      accessor: "title",
      id: "title",
      disableFilters: true
    },
    {
      Header: t("admin.productTable.header.price", "Price")!,
      accessor: (row) => row.pricing.displayPrice,
      id: "price",
      disableFilters: true
    },
    {
      Header: t("admin.productTable.header.published", "Published")!,
      Cell: ({ row }: CellProps<Product, string>) => <PublishedStatusCell row={row} />,
      id: "published"
    },
    {
      Header: t("admin.productTable.header.visible", "Visible")!,
      Cell: ({ row }: CellProps<Product, string>) => <StatusIconCell row={row} />,
      accessor: (row) => row.isVisible,
      id: "isVisible",
      Filter: SelectColumnFilter,
      filterLabel: t("admin.productTable.header.visible", "Visible"),
      filterOptions: [
        { label: t("admin.tags.visible", "Visible"), value: true },
        { label: t("admin.product.publishStatus.unpublished", "Unpublished"), value: false }
      ]
    }
  ], [t]);

  useEffect(() => {
    if (!initialLoad) {
      return tableRef.current?.reset();
    }
    setInitialLoad(false);
  }, [currentShop]);

  const onFetchData = useCallback(async ({ pageIndex, pageSize, filters }) => {
    setLoading(true);

    const filtersByKey: {isVisible?: boolean} = {}
    // @ts-ignore
    filters.forEach(filter => filtersByKey[filter.id] = filter.value)
    
    const shopIds = currentShop?.shopType === "primary" ?
      viewer?.adminUIShops.map(shop => shop._id) :
      [currentShop?._id || ""];

    const { data } = await getProducts({
      variables: {
        shopIds,
        first: pageSize,
        ...filtersByKey,
        offset: pageIndex * pageSize
      }
    });

    setProducts(data?.products?.nodes || []);
    setTotalCount(data?.products?.totalCount || 0);

    setLoading(false);
  }, [currentShop]);

  const onRowClick = useCallback((row) => {
    console.log(row);

    navigate(row.id);
  }, [navigate]);

  const labels = useMemo(() => ({
    globalFilterPlaceholder: t("admin.productTable.filters.placeholder")
  }), []);

  const handleCreateProduct = async () => {
    const { data } = await createProduct({ variables: { input: { currentShop } } });

    if (data) {
      const { createProduct: { product } } = data;
      navigate(product._id);
    }

    if (createProductError) {
      enqueueSnackbar(t("admin.productTable.bulkActions.error", { variant: "error" }));
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        display="flex"
      >
        <Typography variant="h4" flex={1}>
          {t("admin.products", "Products")}
        </Typography>
        <Button
          color="primary"
          variant="contained"
          onClick={handleCreateProduct}
          disableElevation
        >
          {t("admin.createProduct", "Create product")}
        </Button>
      </Box>
      <Card>
        <CardContent>
          <Table
            ref={tableRef}
            loading={loading}
            data={products}
            columns={columns}
            count={totalCount}
            onFetchData={onFetchData}
            onRowClick={onRowClick}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProductsTable;
