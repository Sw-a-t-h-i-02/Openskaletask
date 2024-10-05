
import React, {useEffect,useState } from 'react';
import './task.css'

const Task=()=>{
  const [dishes,setDishes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [orders,setOrders]=useState(()=>{
    const savedOrders=localStorage.getItem('orders');
    return savedOrders?JSON.parse(savedOrders):[];
  });
  const [selectedItems,setSelectedItems]=useState([]);
  const [tableNumber,setTableNumber]=useState('');
  const [contactNumber,setContactNumber] =useState('');
  const [orderDate,setOrderDate]=useState('');
  const [orderTime,setOrderTime]=useState('');

  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const response=await fetch('https://api.jsonbin.io/v3/b/66faa41facd3cb34a88ed968');
        if (!response.ok){
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const dishesData = data.record;

        if (Array.isArray(dishesData)) {
          setDishes(dishesData);
        } else {
          setError('Data format error: Expected an array');
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setError('Error fetching dishes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  
  const handleAddToOrder = (dish) => {
    const existingItem = selectedItems.find(item => item.name === dish.name);
    const updatedDishes = dishes.map(d => {
      if (d.id === dish.id && d.available_quantity > 0) {
        return {...d,available_quantity: d.available_quantity - 1 };
      }
      return d;
    });

    setDishes(updatedDishes);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      setSelectedItems([...selectedItems, { name: dish.name, price: dish.price, quantity: 1 }]);
    }

    // alert(`${dish.name} has been added to your order!`);
  };

  const handlePlaceOrder = () => {
    const newOrder = {
      id: orders.length + 1,
      tableNumber,
      contactNumber,
      date: orderDate,
      time: orderTime,
      items: selectedItems,
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    resetOrderForm();
  };
  const resetOrderForm = () => {
    setSelectedItems([]);
    setTableNumber('');
    setContactNumber('');
    setOrderDate('');
    setOrderTime('');
  };

  return (
    <div className='container'>
      <h1>Menu</h1>

      {loading && <p>Loading dishes...</p>}
      {error && <p>{error}</p>}

      <div className='sub-container'>
        {Array.isArray(dishes) && dishes.length > 0 ? (
          dishes.map((dish) => (
            <div key={dish.id} style={{ margin: '20px', flex: '1 0 30%', boxSizing: 'border-box' }}>
              <h3>{dish.name}</h3>
              <img className='image' src={dish.image_url} alt={dish.name} />
              <p><b>Category :</b> {dish.category}</p>
              <p><b>Available :</b> {dish.available_quantity}</p>
              <p><b>Price : </b>₹{dish.price}</p>
              <button className='button'
                onClick={() => handleAddToOrder(dish)}
                disabled={dish.available_quantity === 0}
              >
                {dish.available_quantity > 0 ? 'Add to Order' : 'Out of Stock'}
              </button>
            </div>
          ))
        ) : (
          <p>No dishes available</p>
        )}
      </div>

      <h2>Order Details</h2>
      <div>
        <label>Table : </label>
        <input 
          type="text"
          placeholder="Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />
        <label>Contact number : </label>
        <input
          type="text"
          placeholder="Contact Number (optional)"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />   
        <label>Date : </label>
        <input
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
        />
        <label>Time : </label>
        <input
          type="time"
          value={orderTime}
          onChange={(e) => setOrderTime(e.target.value)}
        />
      </div>

      <h3>Selected Items</h3>
      <ol>
        {selectedItems.map((item, index) => (
          <li key={index}>
            {item.name} - ₹{item.price.toFixed(2)} x {item.quantity}
          </li>
        ))}
      </ol>

      <button className='button' onClick={handlePlaceOrder} disabled={selectedItems.length === 0}>
        Place Order
      </button>

      <h2>Order History</h2>
      <div>
        {orders.length === 0 ? (
          <p>No orders placed yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id}>
              <h4>Order ID: {order.id}</h4>
              <p>Table: {order.tableNumber} | Contact: {order.contactNumber}</p>
              <p>Date: {order.date} | Time: {order.time}</p>
              <h5>Items:</h5>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} - ₹{item.price.toFixed(2)} x {item.quantity}
                  </li>
                ))}
              </ul>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Task;


