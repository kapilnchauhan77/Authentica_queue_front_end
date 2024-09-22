// src/components/CustomerForm.js

import React, { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  Container,
  TextField,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault('Asia/Kolkata');
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

function CustomerForm() {
  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [reservationTimeOption, setReservationTimeOption] = useState('now');
  const [reservationTime, setReservationTime] = useState(dayjs());
  const [message, setMessage] = useState('');
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !partySize || !contactNumber) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      const reservationTimeToSend =
        reservationTimeOption === 'now'
          ? "now"
          : reservationTime.toISOString();

      const response = await axios.post('https://unicorn-first-oyster.ngrok-free.app/api/queue', {
        name: name,
        party_size: parseInt(partySize),
        contact_number: contactNumber,
        reservation_time: reservationTimeToSend,
      }, {
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },});

      setMessage(response.data.message);
      setEstimatedWaitTime(response.data.estimated_wait_time);

      // Clear form fields
      setName('');
      setPartySize('');
      setContactNumber('');
      setReservationTime(dayjs());
      setReservationTimeOption('now');
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Join the Queue
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Number of People"
            type="number"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Contact Number"
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
            fullWidth
          />
          <FormControl component="fieldset">
            <FormLabel component="legend">Time of Reservation</FormLabel>
            <RadioGroup
              aria-label="reservation-time"
              name="reservation-time"
              value={reservationTimeOption}
              onChange={(e) => setReservationTimeOption(e.target.value)}
              row
            >
              <FormControlLabel
                value="now"
                control={<Radio />}
                label="Now"
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label="Custom Time"
              />
            </RadioGroup>
          </FormControl>
          {reservationTimeOption === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Select Reservation Time"
                value={reservationTime}
                onChange={(newValue) => setReservationTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDateTime={dayjs()}
              />
            </LocalizationProvider>
          )}
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Join Queue
          </Button>
          {message && (
            <Typography color="error" align="center">
              {message}
            </Typography>
          )}
          {estimatedWaitTime !== null && (
            <Typography align="center">
              Estimated Wait Time: {estimatedWaitTime} minutes
            </Typography>
          )}
        </Stack>
      </form>
    </Container>
  );
}

export default CustomerForm;
