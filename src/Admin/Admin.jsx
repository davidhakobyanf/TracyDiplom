import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Select, InputNumber, Tabs, Form, Input, DatePicker, Card, Statistic, Popconfirm } from 'antd';
import AddFoodComponent from "./components/AddFoodComponent";
import Navbar from "../Profile/Navbar/Navbar";
import moment from 'moment';

const { Option } = Select;
const { TabPane } = Tabs;

const Admin = () => {
    // Foods state
    const [foods, setFoods] = useState([]);
    const [foodsLoading, setFoodsLoading] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState(null);
    const [portions, setPortions] = useState({});

    // Meals state
    const [meals, setMeals] = useState([]);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [selectedMealDetails, setSelectedMealDetails] = useState(null);
    const [isMealModalVisible, setIsMealModalVisible] = useState(false);
    const [mealForm] = Form.useForm();

    const [activeTab, setActiveTab] = useState('foods');
    const NameFromLocalStorage = localStorage.getItem('Name');

    // Fetch all foods
    const fetchFoods = async () => {
        setFoodsLoading(true);
        try {
            const response = await fetch('/api/foods');
            if (response.ok) {
                const data = await response.json();
                setFoods(data);
                // Initialize portions
                const defaultPortions = {};
                data.forEach(food => {
                    defaultPortions[food.id] = 100;
                });
                setPortions(defaultPortions);
            } else {
                throw new Error('Failed to fetch foods');
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setFoodsLoading(false);
        }
    };

    // Fetch all meals
    const fetchMeals = async () => {
        try {
            const response = await fetch('/api/meals');
            if (response.ok) {
                const data = await response.json();
                setMeals(data);
            } else {
                throw new Error('Failed to fetch meals');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Fetch meal details
    const fetchMealDetails = async (mealId) => {
        try {
            const response = await fetch(`/api/meals/${mealId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedMealDetails(data);
            } else {
                throw new Error('Failed to fetch meal details');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Create new meal
    const createMeal = async (values) => {
        try {
            const response = await fetch('/api/meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mealType: values.mealType,
                    dateTime: values.dateTime.format('YYYY-MM-DDTHH:mm:ss')
                })
            });

            if (response.ok) {
                const createdMeal = await response.json();
                message.success('Meal created successfully');
                setIsMealModalVisible(false);
                mealForm.resetFields();
                fetchMeals(); // Refresh meals list
                setSelectedMeal(createdMeal.id); // Select the newly created meal
                fetchMealDetails(createdMeal.id); // Load details for the new meal
            } else {
                throw new Error('Failed to create meal');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Delete a food item
    const deleteFood = async (id) => {
        try {
            const response = await fetch(`/api/foods/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                message.success('Food deleted successfully');
                fetchFoods(); // Refresh the list
            } else {
                throw new Error('Failed to delete food');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Delete a meal
    const deleteMeal = async (mealId) => {
        try {
            const response = await fetch(`/api/meals/${mealId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                message.success('Meal deleted successfully');
                fetchMeals(); // Refresh meals list
                if (selectedMeal === mealId) {
                    setSelectedMeal(null);
                    setSelectedMealDetails(null);
                }
            } else {
                throw new Error('Failed to delete meal');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Remove food from meal
    const removeFoodFromMeal = async (mealId, foodId) => {
        try {
            const response = await fetch(`/api/meals/${mealId}/foods/${foodId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                message.success('Food removed from meal successfully');
                fetchMealDetails(mealId); // Refresh meal details
            } else {
                throw new Error('Failed to remove food from meal');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Add food to meal with portion
    const addFoodToMeal = async (foodId) => {
        if (!selectedMeal) {
            message.warning('Please select a meal first');
            return;
        }

        const portion = portions[foodId] || 100;

        try {
            const response = await fetch(
                `/api/meals/${selectedMeal}/foods/${foodId}?portion=${portion}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                message.success(`Added ${portion}g to meal successfully`);
                fetchMealDetails(selectedMeal); // Refresh meal details
            } else {
                throw new Error('Failed to add food to meal');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Handle portion change
    const handlePortionChange = (foodId, value) => {
        setPortions(prev => ({
            ...prev,
            [foodId]: value
        }));
    };

    // Handle meal selection change
    const handleMealSelect = (mealId) => {
        setSelectedMeal(mealId);
        fetchMealDetails(mealId);
    };

    // Columns for foods table
    const foodsColumns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Calories (100g)',
            dataIndex: 'caloriesPer100g',
            key: 'calories',
        },
        {
            title: 'Protein (100g)',
            dataIndex: 'proteinPer100g',
            key: 'protein',
        },
        {
            title: 'Carbs (100g)',
            dataIndex: 'carbsPer100g',
            key: 'carbs',
        },
        {
            title: 'Fat (100g)',
            dataIndex: 'fatPer100g',
            key: 'fat',
        },
        {
            title: 'Portion (g)',
            key: 'portion',
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={1000}
                    defaultValue={100}
                    value={portions[record.id] || 100}
                    onChange={(value) => handlePortionChange(record.id, value)}
                />
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => addFoodToMeal(record.id)}
                        disabled={!selectedMeal}
                    >
                        Add to Meal
                    </Button>

                    <Button type="primary" danger onClick={() => deleteFood(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    // Columns for meal foods table
    const mealFoodsColumns = [
        {
            title: 'Food',
            dataIndex: ['food', 'name'],
            key: 'foodName',
        },
        {
            title: 'Portion (g)',
            dataIndex: 'portion',
            key: 'portion',
        },
        {
            title: 'Calories',
            key: 'calories',
            render: (_, record) => (
                (record.food.caloriesPer100g * record.portion / 100).toFixed(2)
            ),
        },
        {
            title: 'Protein',
            key: 'protein',
            render: (_, record) => (
                (record.food.proteinPer100g * record.portion / 100).toFixed(2)
            ),
        },
        {
            title: 'Carbs',
            key: 'carbs',
            render: (_, record) => (
                (record.food.carbsPer100g * record.portion / 100).toFixed(2)
            ),
        },
        {
            title: 'Fat',
            key: 'fat',
            render: (_, record) => (
                (record.food.fatPer100g * record.portion / 100).toFixed(2)
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => removeFoodFromMeal(selectedMeal, record.food.id)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    // Fetch data on component mount
    useEffect(() => {
        fetchFoods();
        fetchMeals();
    }, []);

    // Handle when a new food is added
    const handleFoodAdded = () => {
        fetchFoods(); // Refresh the list
    };

    return (
        <div>
            <Navbar name={NameFromLocalStorage}/>
            <div style={{ marginTop: "64px", padding: "24px" }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Foods" key="foods">
                        <div style={{ marginBottom: "16px", display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <AddFoodComponent onFoodAdded={handleFoodAdded} />
                            <Select
                                placeholder="Filter by meal type"
                                style={{ width: 200 }}
                                onChange={setSelectedMealType}
                                value={selectedMealType}
                                allowClear
                            >
                                <Option value="BREAKFAST">Breakfast</Option>
                                <Option value="LUNCH">Lunch</Option>
                                <Option value="DINNER">Dinner</Option>
                                <Option value="SNACK">Snack</Option>
                            </Select>
                            <Select
                                placeholder="Select a meal"
                                style={{ width: 300 }}
                                onChange={handleMealSelect}
                                value={selectedMeal}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {meals
                                    .filter(meal => !selectedMealType || meal.mealType === selectedMealType)
                                    .map(meal => (
                                        <Option key={meal.id} value={meal.id}>
                                            {moment(meal.dateTime).format('YYYY-MM-DD HH:mm')} - {meal.mealType}
                                        </Option>
                                    ))}
                            </Select>
                        </div>
                        <Table
                            columns={foodsColumns}
                            dataSource={foods}
                            rowKey="id"
                            loading={foodsLoading}
                            bordered
                        />
                    </TabPane>

                    <TabPane tab="Meals" key="meals">
                        <div style={{ marginBottom: "16px", display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Select
                                placeholder="Select a meal"
                                style={{ width: 300 }}
                                onChange={handleMealSelect}
                                value={selectedMeal}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {meals.map(meal => (
                                    <Option key={meal.id} value={meal.id}>
                                        {moment(meal.dateTime).format('YYYY-MM-DD HH:mm')} - {meal.mealType}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                onClick={() => setIsMealModalVisible(true)}
                            >
                                Create New Meal
                            </Button>
                            {selectedMeal && (
                                <Popconfirm
                                    title="Are you sure you want to delete this meal?"
                                    onConfirm={() => deleteMeal(selectedMeal)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="primary" danger>
                                        Delete Meal
                                    </Button>
                                </Popconfirm>
                            )}
                        </div>

                        {selectedMealDetails && (
                            <>
                                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                                    <Card>
                                        <Statistic
                                            title="Total Calories"
                                            value={selectedMealDetails.totalCalories.toFixed(2)}
                                        />
                                    </Card>
                                    <Card>
                                        <Statistic
                                            title="Total Protein (g)"
                                            value={selectedMealDetails.totalProtein.toFixed(2)}
                                        />
                                    </Card>
                                    <Card>
                                        <Statistic
                                            title="Total Carbs (g)"
                                            value={selectedMealDetails.totalCarbs.toFixed(2)}
                                        />
                                    </Card>
                                    <Card>
                                        <Statistic
                                            title="Total Fat (g)"
                                            value={selectedMealDetails.totalFat.toFixed(2)}
                                        />
                                    </Card>
                                </div>

                                <Table
                                    columns={mealFoodsColumns}
                                    dataSource={selectedMealDetails.mealFoods}
                                    rowKey="id"
                                    bordered
                                />
                            </>
                        )}

                        {/* Modal for creating new meal */}
                        <Modal
                            title="Create New Meal"
                            visible={isMealModalVisible}
                            onOk={() => mealForm.submit()}
                            onCancel={() => {
                                setIsMealModalVisible(false);
                                mealForm.resetFields();
                            }}
                            okText="Create"
                        >
                            <Form
                                form={mealForm}
                                layout="vertical"
                                onFinish={createMeal}
                            >
                                <Form.Item
                                    name="mealType"
                                    label="Meal Type"
                                    rules={[{ required: true, message: 'Please select meal type' }]}
                                >
                                    <Select placeholder="Select meal type">
                                        <Option value="BREAKFAST">Breakfast</Option>
                                        <Option value="LUNCH">Lunch</Option>
                                        <Option value="DINNER">Dinner</Option>
                                        <Option value="SNACK">Snack</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="dateTime"
                                    label="Date & Time"
                                    rules={[{ required: true, message: 'Please select date and time' }]}
                                >
                                    <DatePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default Admin;