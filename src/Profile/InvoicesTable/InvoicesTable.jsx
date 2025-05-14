import React, { useEffect, useReducer } from 'react';
import { Table, Radio, Divider, message } from 'antd';
import axios from 'axios';

const initialState = {
    data: [],
    products: [],
    invoiceLines: [],
    totalAmountArray: [],
    selectionType: 'checkbox',
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_DATA':
            return { ...state, data: action.payload };
        case 'SET_PRODUCTS':
            return { ...state, products: action.payload };
        case 'SET_INVOICE_LINES':
            return { ...state, invoiceLines: action.payload };
        case 'SET_TOTAL_AMOUNT_ARRAY':
            return { ...state, totalAmountArray: action.payload };
        case 'SET_SELECTION_TYPE':
            return { ...state, selectionType: action.payload };
        default:
            return state;
    }
};

const InvoicesTable = ({ userIdFromLocalStorage, selectedInvoiceIds, setSelectedInvoiceIds }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const fetchData = async () => {
            message.loading({ content: 'Loading...', key: 'fetching' });
            try {
                const [invoiceResponse, productResponse, invoiceLinesResponse] = await Promise.all([
                    axios.get('https://bever-aca-assignment.azurewebsites.net/invoices'),
                    axios.get('https://bever-aca-assignment.azurewebsites.net/products'),
                    axios.get('https://bever-aca-assignment.azurewebsites.net/invoicelines')
                ]);

                const filteredInvoices = invoiceResponse.data.value.filter(
                    invoice => invoice.UserId === userIdFromLocalStorage
                );
                const dataWithKeys = filteredInvoices.map((invoice, index) => ({
                    key: index,
                    InvoiceId: invoice.InvoiceId,
                    Name: invoice.Name,
                    PaidDate: new Date(invoice.PaidDate).toLocaleDateString(),
                    Amount: invoice.Amount,
                }));

                dispatch({ type: 'SET_DATA', payload: dataWithKeys });
                dispatch({ type: 'SET_PRODUCTS', payload: productResponse.data.value });
                dispatch({ type: 'SET_INVOICE_LINES', payload: invoiceLinesResponse.data.value });

                message.success({ content: 'Data loaded successfully!', key: 'fetching', duration: 2 });
            } catch (error) {
                message.error({ content: 'Error fetching data', key: 'fetching', duration: 2 });
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [userIdFromLocalStorage]);

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

            dispatch({ type: 'SET_TOTAL_AMOUNT_ARRAY', payload: totalsArray });
        }
    }, [state.invoiceLines, state.products]);

    const getTotalAmount = (invoiceId) => {
        const total = state.totalAmountArray.find(item => item.InvoiceId === invoiceId);
        return total ? total.AllTotalAmount : 'N/A';
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'Name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Paid Date',
            dataIndex: 'PaidDate',
        },
        {
            title: 'Total Amount',
            dataIndex: 'InvoiceId',
            render: (invoiceId) => getTotalAmount(invoiceId),
        },
    ];

    const rowSelection = {
        onChange: (selectedRowKeys) => {
            setSelectedInvoiceIds(selectedRowKeys);
        },
        selectedRowKeys: selectedInvoiceIds,
    };

    return (
        <div>
            <Radio.Group
                onChange={({ target: { value } }) => dispatch({ type: 'SET_SELECTION_TYPE', payload: value })}
                value={state.selectionType}
            >
                <Radio value="checkbox">Checkbox</Radio>
                <Radio value="radio">Radio</Radio>
            </Radio.Group>

            <Divider />

            <Table
                rowSelection={{
                    type: state.selectionType,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={state.data}
                rowKey="InvoiceId"
                title={() => 'Invoices'}
            />
        </div>
    );
};

export default InvoicesTable;
