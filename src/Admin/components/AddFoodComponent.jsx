import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, message, Modal } from 'antd';

const AddFoodComponent = () => {
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch('/api/foods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success('Food item added successfully!');
                form.resetFields();
                setVisible(false);
            } else {
                throw new Error('Failed to add food item');
            }
        } catch (error) {
            message.error('Failed to add food item');
            console.error('Error adding food:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Add Food
            </Button>

            <Modal
                title="Add New Food Item"
                open={visible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        caloriesPer100g: 0,
                        proteinPer100g: 0,
                        carbsPer100g: 0,
                        fatPer100g: 0,
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the food name!' }]}
                    >
                        <Input placeholder="Enter food name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea placeholder="Enter food description" />
                    </Form.Item>

                    <Form.Item
                        name="caloriesPer100g"
                        label="Calories (per 100g)"
                        rules={[{ required: true, message: 'Please input calories!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="proteinPer100g"
                        label="Protein (per 100g)"
                        rules={[{ required: true, message: 'Please input protein!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="carbsPer100g"
                        label="Carbs (per 100g)"
                        rules={[{ required: true, message: 'Please input carbs!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="fatPer100g"
                        label="Fat (per 100g)"
                        rules={[{ required: true, message: 'Please input fat!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{ marginRight: 8 }}
                        >
                            Add
                        </Button>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddFoodComponent;