import React, { useEffect, useReducer } from 'react';
import { Table, message } from 'antd';
import axios from 'axios';

const initialState = {
    invoiceLines: [],
    products: [],
    totalsArray: [],
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_INVOICE_LINES':
            return { ...state, invoiceLines: action.payload };
        case 'SET_PRODUCTS':
            return { ...state, products: action.payload };
        case 'SET_TOTALS_ARRAY':
            return { ...state, totalsArray: action.payload };
        default:
            return state;
    }
};

const InvoiceLines = ({ selectedInvoiceIds, setTotalAmountArray }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const fetchInvoiceLines = async () => {
            message.loading({ content: 'Loading invoice lines...', key: 'fetchingInvoiceLines' });
            try {
                const response = await axios.get('https://bever-aca-assignment.azurewebsites.net/invoicelines');
                const invoiceLinesData = response.data.value;
                const filteredInvoiceLines = invoiceLinesData.filter(
                    (line) => selectedInvoiceIds.includes(line.InvoiceId)
                );

                dispatch({ type: 'SET_INVOICE_LINES', payload: filteredInvoiceLines });
                message.success({ content: 'Invoice lines loaded successfully!', key: 'fetchingInvoiceLines', duration: 2 });
            } catch (error) {
                message.error({ content: 'Error fetching invoice lines', key: 'fetchingInvoiceLines', duration: 2 });
                console.error('Error fetching invoice lines:', error);
            }
        };

        const fetchProducts = async () => {
            message.loading({ content: 'Loading products...', key: 'fetchingProducts' });
            try {
                const response = await axios.get('https://bever-aca-assignment.azurewebsites.net/products');
                dispatch({ type: 'SET_PRODUCTS', payload: response.data.value });
                message.success({ content: 'Products loaded successfully!', key: 'fetchingProducts', duration: 2 });
            } catch (error) {
                message.error({ content: 'Error fetching products', key: 'fetchingProducts', duration: 2 });
                console.error('Error fetching products:', error);
            }
        };

        fetchInvoiceLines();
        fetchProducts();
    }, [selectedInvoiceIds]);

    useEffect(() => {
        if (state.invoiceLines.length && state.products.length) {
            const totals = state.invoiceLines.reduce((acc, line) => {
                const productDetails = state.products.find((prod) => prod.ProductId === line.ProductId) || { Price: 0 };
                const totalAmount = line.Quantity * productDetails.Price;
                if (!acc[line.InvoiceId]) {
                    acc[line.InvoiceId] = 0;
                }
                acc[line.InvoiceId] += totalAmount;
                return acc;
            }, {});

            const totalsArray = Object.keys(totals).map((invoiceId) => ({
                InvoiceId: invoiceId,
                AllTotalAmount: totals[invoiceId],
            }));

            dispatch({ type: 'SET_TOTALS_ARRAY', payload: totalsArray });
            setTotalAmountArray(totalsArray);
        }
    }, [state.invoiceLines, state.products, setTotalAmountArray]);

    const getProductDetails = (productId) => {
        const product = state.products.find((prod) => prod.ProductId === productId);
        return product ? product : { Name: 'Unknown', Price: 0 };
    };

    const columns = [
        {
            title: 'Product',
            key: 'ProductName',
            render: (text, record) => getProductDetails(record.ProductId).Name,
        },
        {
            title: 'Price Per Unit',
            key: 'ProductPrice',
            render: (text, record) => getProductDetails(record.ProductId).Price,
        },
        {
            title: 'Quantity',
            dataIndex: 'Quantity',
            key: 'Quantity',
        },
        {
            title: 'Total Amount',
            key: 'TotalAmount',
            render: (text, record) => record.Quantity * getProductDetails(record.ProductId).Price,
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={state.invoiceLines}
            rowKey="InvoiceLineId"
            title={() => 'Invoice Lines'}
        />
    );
};

export default InvoiceLines;
