import React, { useState, useEffect } from 'react';
import { Table, Select, Tabs, Card, Statistic, DatePicker, message, Tag } from 'antd';
import Navbar from "./Navbar/Navbar";
import moment from 'moment';

const { Option } = Select;
const { TabPane } = Tabs;

const Profile = () => {
    const NameFromLocalStorage = localStorage.getItem('Name');
    const userId = localStorage.getItem('userId') || localStorage.getItem('UserId');


    const [meals, setMeals] = useState([]);
    const [filteredMeals, setFilteredMeals] = useState([]);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [selectedMealDetails, setSelectedMealDetails] = useState(null);
    const [selectedMealType, setSelectedMealType] = useState('BREAKFAST');
    const [loading, setLoading] = useState(false);
    const [userDiets, setUserDiets] = useState([]); // Changed to array
    const [selectedDate, setSelectedDate] = useState(moment());

    // Fetch all meals
    const fetchMeals = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/meals');
            if (response.ok) {
                const data = await response.json();
                setMeals(data);
                setFilteredMeals(data.filter(meal => meal.mealType === 'BREAKFAST'));
            } else {
                throw new Error('Failed to fetch meals');
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user diet data
    const fetchUserDiet = async () => {
        if (!userId) return;
        console.log(userId,'UserIdFromLocalStorage')
        setLoading(true);
        try {
            const response = await fetch(`/api/diets/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserDiets(Array.isArray(data) ? data : [data]); // Ensure it's always an array
            } else {
                throw new Error('Failed to fetch user diet');
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter meals by type
    useEffect(() => {
        if (meals.length > 0) {
            setFilteredMeals(meals.filter(meal => meal.mealType === selectedMealType));
        }
    }, [selectedMealType, meals]);

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

    // Add meal to diet
    const addMealToDiet = async () => {
        if (!selectedMeal) {
            message.warning('Please select a meal first');
            return;
        }

        let dietId = localStorage.getItem('dietId');
        if (!dietId) {
            const currentUserString = localStorage.getItem('currentUser');
            if (currentUserString) {
                try {
                    const currentUser = JSON.parse(currentUserString);
                    dietId = currentUser.dietId;
                } catch (error) {
                    console.error('Error parsing currentUser from localStorage:', error);
                }
            }
        }

        if (!dietId) {
            message.error('Diet ID not found. Please login again.');
            return;
        }

        try {
            const response = await fetch(
                `/api/diets/${dietId}/meal/${selectedMeal}/type/${selectedMealType}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                message.success(`Meal added to your ${selectedMealType.toLowerCase()} successfully`);
                fetchUserDiet(); // Refresh user diet data after adding
            } else {
                throw new Error('Failed to add meal to diet');
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    // Handle meal selection change
    const handleMealSelect = (mealId) => {
        setSelectedMeal(mealId);
        fetchMealDetails(mealId);
    };

    // Get current diet based on selected date
    const getCurrentDiet = () => {
        if (!userDiets || userDiets.length === 0) return null;

        const dateStr = selectedDate.format('YYYY-MM-DD');
        return userDiets.find(diet => diet.date === dateStr) || null;
    };

    // Render goal status message
    const renderGoalStatus = (goalMet, nutrient) => {
        return goalMet ?
            <Tag color="green">Good job! You've met your {nutrient} goal</Tag> :
            <Tag color="orange">You haven't met your {nutrient} goal yet</Tag>;
    };

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
    ];

    // Function to render meal details for My Meals tab
    const renderMealDetails = (meal) => {
        if (!meal) return <div>No meal data</div>;

        return (
            <>
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                    <Card>
                        <Statistic
                            title="Calories"
                            value={meal.totalCalories ? meal.totalCalories.toFixed(2) : "0.00"}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Protein (g)"
                            value={meal.totalProtein ? meal.totalProtein.toFixed(2) : "0.00"}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Carbs (g)"
                            value={meal.totalCarbs ? meal.totalCarbs.toFixed(2) : "0.00"}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Fat (g)"
                            value={meal.totalFat ? meal.totalFat.toFixed(2) : "0.00"}
                        />
                    </Card>
                </div>

                <Table
                    columns={mealFoodsColumns}
                    dataSource={meal.mealFoods || []}
                    rowKey="id"
                    bordered
                    pagination={false}
                />
            </>
        );
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchMeals();
        fetchUserDiet();
    }, []);

    const currentDiet = getCurrentDiet();

    return (
        <div>
            <Navbar name={NameFromLocalStorage}/>
            <div style={{ marginTop: "64px", padding: "24px" }}>
                <Tabs defaultActiveKey="meals">
                    <TabPane tab="Meals" key="meals">
                        <div style={{ marginBottom: "16px", display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Select
                                placeholder="Select meal type"
                                style={{ width: 200 }}
                                value={selectedMealType}
                                onChange={setSelectedMealType}
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
                                {filteredMeals.map(meal => (
                                    <Option key={meal.id} value={meal.id}>
                                        Id:{meal?.id} - {meal.name || `${meal.mealType} Meal`}
                                    </Option>
                                ))}
                            </Select>

                            <button
                                onClick={addMealToDiet}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#1890ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                disabled={!selectedMeal}
                            >
                                Add to My Diet
                            </button>
                        </div>

                        {selectedMealDetails && renderMealDetails(selectedMealDetails)}
                    </TabPane>

                    <TabPane tab="My Meals" key="myMeals">
                        <div style={{ marginBottom: '16px' }}>


                            {currentDiet ? (
                                <div>
                                    <Tabs defaultActiveKey="breakfast">
                                        <TabPane tab="Breakfast" key="breakfast">
                                            {currentDiet.breakfast ?
                                                renderMealDetails(currentDiet.breakfast) :
                                                <div>No breakfast planned for this day</div>}
                                        </TabPane>
                                        <TabPane tab="Lunch" key="lunch">
                                            {currentDiet.lunch ?
                                                renderMealDetails(currentDiet.lunch) :
                                                <div>No lunch planned for this day</div>}
                                        </TabPane>
                                        <TabPane tab="Dinner" key="dinner">
                                            {currentDiet.dinner ?
                                                renderMealDetails(currentDiet.dinner) :
                                                <div>No dinner planned for this day</div>}
                                        </TabPane>
                                        <TabPane tab="Snack" key="snack">
                                            {currentDiet.snack ?
                                                renderMealDetails(currentDiet.snack) :
                                                <div>No snack planned for this day</div>}
                                        </TabPane>
                                    </Tabs>

                                    <div style={{ marginTop: '24px' }}>
                                        <h3>Daily Totals</h3>
                                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                            <Card>
                                                <Statistic
                                                    title="Total Calories"
                                                    value={currentDiet.totalCalories?.toFixed(2) || '0.00'}
                                                    suffix={`/ ${currentDiet.nutritionGoal?.dailyCalorieTarget?.toFixed(2) || 'N/A'}`}
                                                />
                                            </Card>
                                            <Card>
                                                <Statistic
                                                    title="Total Protein (g)"
                                                    value={currentDiet.totalProtein?.toFixed(2) || '0.00'}
                                                    suffix={`/ ${currentDiet.nutritionGoal?.dailyProteinTarget?.toFixed(2) || 'N/A'}`}
                                                />
                                            </Card>
                                            <Card>
                                                <Statistic
                                                    title="Total Carbs (g)"
                                                    value={currentDiet.totalCarbs?.toFixed(2) || '0.00'}
                                                    suffix={`/ ${currentDiet.nutritionGoal?.dailyCarbsTarget?.toFixed(2) || 'N/A'}`}
                                                />
                                            </Card>
                                            <Card>
                                                <Statistic
                                                    title="Total Fat (g)"
                                                    value={currentDiet.totalFat?.toFixed(2) || '0.00'}
                                                    suffix={`/ ${currentDiet.nutritionGoal?.dailyFatTarget?.toFixed(2) || 'N/A'}`}
                                                />
                                            </Card>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {renderGoalStatus(currentDiet.calorieGoalMet, 'calorie')}
                                            {renderGoalStatus(currentDiet.proteinGoalMet, 'protein')}
                                            {renderGoalStatus(currentDiet.carbsGoalMet, 'carb')}
                                            {renderGoalStatus(currentDiet.fatGoalMet, 'fat')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {userDiets.length > 0 ?
                                        'No diet data for selected date' :
                                        'Loading diet information...'}
                                </div>
                            )}
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default Profile;