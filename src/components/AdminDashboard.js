
// src/components/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
  Container,
  Paper,
  Stack,
  Box,
} from '@mui/material';

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [message, setMessage] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('');

  useEffect(() => {
    fetchQueue();
    fetchTables();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/queue');
      setQueue(response.data);
    } catch (error) {
      console.error('Error fetching queue', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables', error);
    }
  };

  const allocateTable = async () => {
    if (!selectedCustomer || !selectedTable) {
      setMessage('Please select a customer and a table.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/admin/allocate_table', {
        customer_id: parseInt(selectedCustomer),
        table_id: parseInt(selectedTable),
      });
      setMessage(response.data.message);
      setSelectedCustomer('');
      setSelectedTable('');
      fetchQueue(); // Refresh the queue
      fetchTables(); // Refresh the table statuses
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  const addTable = async () => {
    if (!newTableCapacity) {
      setMessage('Please enter a table capacity.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/admin/tables', {
        capacity: parseInt(newTableCapacity),
      });
      setMessage(response.data.message);
      setNewTableCapacity('');
      fetchTables(); // Refresh the table list
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/tables/${tableId}`, {
        status: newStatus,
      });
      setMessage(response.data.message);
      fetchTables(); // Refresh the table statuses
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard
      </Typography>

      <Stack spacing={4}>
        {/* Queue Section */}
        <Paper elevation={3} style={{ padding: 16 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Queue</FormLabel>
            <RadioGroup
              aria-label="selectedCustomer"
              name="selectedCustomer"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              {queue.map((customer) => (
                <FormControlLabel
                  key={customer.id}
                  value={String(customer.id)}
                  control={<Radio />}
                  label={
                    <>
                      <strong>Name:</strong> {customer.name},&nbsp;
                      <strong>Party Size:</strong> {customer.party_size},&nbsp;
                      <strong>Contact:</strong> {customer.contact_number},&nbsp;
                      <strong>Reservation Time:</strong>{' '}
                      {new Date(customer.reservation_time).toLocaleString()}
                    </>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Tables Section */}
        <Paper elevation={3} style={{ padding: 16 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Tables</FormLabel>
            <RadioGroup
              aria-label="selectedTable"
              name="selectedTable"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              {tables.map((table) => (
                <Box key={table.id} display="flex" alignItems="center">
                  <FormControlLabel
                    value={String(table.id)}
                    control={<Radio />}
                    label={
                      <>
                        {`Table ID: ${table.id}, Capacity: ${table.capacity}, Status: ${table.status}`}
                        {table.time_seated && (
                          <>, Seated At: {new Date(table.time_seated).toLocaleTimeString()}</>
                        )}
                      </>
                    }
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    style={{ marginLeft: 8 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent radio selection when clicking this button
                      updateTableStatus(
                        table.id,
                        table.status === 'vacant' ? 'occupied' : 'vacant'
                      );
                    }}
                  >
                    Mark as {table.status === 'vacant' ? 'Occupied' : 'Vacant'}
                  </Button>
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Allocate Table Button */}
        <Box textAlign="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={allocateTable}
            disabled={!selectedCustomer || !selectedTable}
          >
            Allocate Table
          </Button>
          {message && (
            <Typography color="error" style={{ marginTop: 16 }}>
              {message}
            </Typography>
          )}
        </Box>

        {/* Add New Table Section */}
        <Paper elevation={3} style={{ padding: 16 }}>
          <Typography variant="h6">Add New Table</Typography>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              addTable();
            }}
            display="flex"
            alignItems="center"
          >
            <TextField
              type="number"
              label="Table Capacity"
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(e.target.value)}
              required
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginLeft: 16 }}
            >
              Add Table
            </Button>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}

export default AdminDashboard;
