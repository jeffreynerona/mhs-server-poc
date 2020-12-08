require('dotenv').config()
const {Buffer} = require('buffer');
const zlib = require('zlib');
const {
  EventHubConsumerClient,
  earliestEventPosition,
} = require('@azure/event-hubs');

const connectionString = process.env.FR_CONNECTION_STRING;
const eventHubName = process.env.FR_EVENT_HUB_NAME;
const consumerGroup = process.env.FR_CONSUMER_GROUP;

async function main(handleEvent = (v) => console.log(v)) {
  const consumerClient = new EventHubConsumerClient(
    consumerGroup,
    connectionString,
    eventHubName,
  );
  let flightData = {};
  const getFinalData = (newData) => {
    if (!newData || typeof newData !== 'object') return flightData;
    const newValues = Object.values(newData).filter((newVal) => Array.isArray(newVal));
    newValues.map((fData) => {
      flightData[fData[9]] = fData;
    });
    return flightData;
  }
  consumerClient.subscribe(
    {
      processEvents: async (events, context) => {
        let currentBuffer = [];
        for (const event of events) {
          if (event && event.body) {
            if (context.partitionId == 1) {
              currentBuffer = [event.body];
            } else {
              currentBuffer = [...currentBuffer, event.body];
              const data = Buffer.concat(currentBuffer);
              zlib.inflate(data, (err, buf) => {
                if (err) {
                  console.log('err', err);
                } else {
                    const inflated = JSON.parse(buf.toString());
                    handleEvent(getFinalData(inflated));
                }
              });
            }
          }
        }
      },
      processError: async (err, context) => {
        console.log(`Error on partition "${context.partitionId}": ${err}`);
      },
    },
    {startPosition: earliestEventPosition},
  );
}

module.exports = main;

