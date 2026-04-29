# Structure

## Instructions
Visit the Escape Room and make payments before joining the queue with the "Join Queue" button below

## Number of People
The number of people in the queue, fetching the number of the queue using the queue API or it should show a dash if the queue is unavailable

## Estimated Wait Time
The estimated wait time, calculate by calculating the number of people in the queue and multiplying it by 15 minutes. Or it shoudl show queue unavailable if the queue is closed

## Join queue
The join queue button should use the queue API to join the queue

-- 
Join queue redirect to a page with QR code that tells the user to scan the QR code to join the queue

## Scan QR code
Scan QR code displays a ticket with the following information:
- Queue number with reference when they joined
- Estimated wait time
- Their place in the queue
