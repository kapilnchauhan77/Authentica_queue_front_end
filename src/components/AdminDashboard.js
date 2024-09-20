
// src/components/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  Typography,
  Container,
  Paper,
  Stack,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend Day.js with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default time zone to Asia/Kolkata (IST)
dayjs.tz.setDefault('Asia/Kolkata');

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [message, setMessage] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState(null);
  const [editTableName, setEditTableName] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('');
  const [newTableName, setNewTableName] = useState('');

  useEffect(() => {
    fetchQueue();
    fetchTables();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await axios.get('https://unicorn-first-oyster.ngrok-free.app/api/admin/queue', {
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },});
      console.log(response)
      setQueue(response.data);
    } catch (error) {
      console.error('Error fetching queue', error);
    }
  };

  const handleTableSelection = (event, tableId) => {
    const tableIdStr = String(tableId);
    if (event.target.checked) {
      setSelectedTables([...selectedTables, tableIdStr]);
    } else {
      setSelectedTables(selectedTables.filter((id) => id !== tableIdStr));
    }
  };

  const handleEditTable = (table) => {
    setTableToEdit(table);
    setEditTableName(table.name || '');
    setEditTableCapacity(table.capacity);
    setEditDialogOpen(true);
  };
  
  const confirmEditTable = async () => {
    if (!editTableCapacity) {
      setMessage('Please enter a table capacity.');
      return;
    }
  
    try {
      await axios.put(`https://your-ngrok-url.ngrok.io/api/admin/tables/${tableToEdit.id}`, {
        name: editTableName,
        capacity: parseInt(editTableCapacity),
      }, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      setMessage('Table updated successfully.');
      setEditDialogOpen(false);
      setTableToEdit(null);
      fetchTables(); // Refresh the table list
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
      setEditDialogOpen(false);
      setTableToEdit(null);
    }
  };
  
  const cancelEditTable = () => {
    setEditDialogOpen(false);
    setTableToEdit(null);
  };

  const allocateTable = async () => {
    if (!selectedCustomer || selectedTables.length === 0) {
      setMessage('Please select a customer and at least one table.');
      return;
    }

    try {
      const response = await axios.post('https://unicorn-first-oyster.ngrok-free.app/api/admin/allocate_table', {
        customer_id: parseInt(selectedCustomer),
        table_ids: selectedTables.map((id) => parseInt(id)),
      }, {
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },});
      setMessage(response.data.message);
      setSelectedCustomer('');
      setSelectedTables([]);
      fetchQueue(); // Refresh the queue
      fetchTables(); // Refresh the table statuses
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get('https://unicorn-first-oyster.ngrok-free.app/api/admin/tables', {
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },});
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables', error);
    }
  };


  const addTable = async () => {
    if (!newTableCapacity) {
      setMessage('Please enter a table capacity.');
      return;
    }

    try {
      const response = await axios.post('https://unicorn-first-oyster.ngrok-free.app/api/admin/tables', {
        capacity: parseInt(newTableCapacity),
      }, {
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },});
      setMessage(response.data.message);
      setNewTableName('');
      setNewTableCapacity('');
      fetchTables(); // Refresh the table list
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      const response = await axios.put(`https://unicorn-first-oyster.ngrok-free.app/api/admin/tables/${tableId}`, {
        status: newStatus,
      }, {
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },});
      setMessage(response.data.message);
      fetchTables(); // Refresh the table statuses
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  const handleDeleteTable = (tableId) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTable = async () => {
    try {
      await axios.delete(`https://your-ngrok-url.ngrok.io/api/admin/tables/${tableToDelete}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      setMessage('Table deleted successfully.');
      setDeleteDialogOpen(false);
      setTableToDelete(null);
      fetchTables(); // Refresh the table list
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  const cancelDeleteTable = () => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
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
            <FormGroup>
              {tables.map((table) => (
                <Box key={table.id} display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTables.includes(String(table.id))}
                        onChange={(e) => handleTableSelection(e, table.id)}
                        name={`table-${table.id}`}
                      />
                    }
                    label={
                      <>
                        {`Table ID: ${table.id}, Name: ${table.name || 'Unnamed'}, Capacity: ${table.capacity}, Status: ${table.status}`}
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
                      e.stopPropagation(); // Prevent checkbox selection when clicking this button
                      updateTableStatus(
                        table.id,
                        table.status === 'vacant' ? 'occupied' : 'vacant'
                      );
                    }}
                  >
                    Mark as {table.status === 'vacant' ? 'Occupied' : 'Vacant'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    style={{ marginLeft: 8 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent checkbox selection when clicking this button
                      handleEditTable(table);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    style={{ marginLeft: 8 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent checkbox selection when clicking this button
                      handleDeleteTable(table.id);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
            </FormGroup>
          </FormControl>
        </Paper>

        {/* Allocate Table Button */}
        <Box textAlign="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={allocateTable}
            disabled={!selectedCustomer || selectedTables.length === 0}
          >
            Allocate Tables
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
              type="text"
              label="Table Name"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              required
            />
            <TextField
              type="number"
              label="Table Capacity"
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(e.target.value)}
              required
              style={{ marginLeft: 16 }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteTable}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Table</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this table?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteTable} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteTable} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={cancelEditTable}
        aria-labelledby="edit-dialog-title"
        aria-describedby="edit-dialog-description"
      >
        <DialogTitle id="edit-dialog-title">Edit Table</DialogTitle>
        <DialogContent>
          <DialogContentText id="edit-dialog-description">
            Edit the table's name and capacity.
          </DialogContentText>
          <TextField
            margin="dense"
            label="Table Name"
            type="text"
            fullWidth
            value={editTableName}
            onChange={(e) => setEditTableName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            value={editTableCapacity}
            onChange={(e) => setEditTableCapacity(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEditTable} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmEditTable} color="secondary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard;
