// ******************************************************************************
// * @file    P2Pserver.js
// * @author  MCD Application Team
// *
//  ******************************************************************************
//  * @attention
//  *
//  * Copyright (c) 2022-2023 STMicroelectronics.
//  * All rights reserved.
//  *
//  * This software is licensed under terms that can be found in the LICENSE file
//  * in the root directory of this software component.
//  * If no LICENSE file comes with this software, it is provided AS-IS.
//  *
//  ******************************************************************************
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const P2Pserver = () => {
  const [latencyData, setLatencyData] = useState([]);
  const [throughputData, setThroughputData] = useState([]);

  // Fonction pour gérer les notifications BLE (latence et débit)
  const notifHandler = (event) => {
    const buf = new Uint8Array(event.target.value.buffer);
    const latency = buf[0];  // Latence simulée
    const throughput = buf[1];  // Débit simulé

    // Mettre à jour les courbes avec les nouvelles données
    setLatencyData(prevData => [...prevData, { x: Date.now(), y: latency }]);
    setThroughputData(prevData => [...prevData, { x: Date.now(), y: throughput }]);
  };

  // Options des graphiques pour la latence et le débit
  const latencyChartOptions = {
    scales: {
      x: { type: 'linear', position: 'bottom' },
      y: { min: 0 },
    },
  };

  const throughputChartOptions = {
    scales: {
      x: { type: 'linear', position: 'bottom' },
      y: { min: 0 },
    },
  };

  // Fonction de connexion et d'abonnement aux notifications BLE
  useEffect(() => {
    const connectBLE = async () => {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['0000fe40-0000-1000-8000-00805f9b34fb'] }]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('0000fe40-0000-1000-8000-00805f9b34fb');

        const latencyCharacteristic = await service.getCharacteristic('0000fe43-8e22-4541-9d4c-21edae82ed19');
        const throughputCharacteristic = await service.getCharacteristic('0000fe44-8e22-4541-9d4c-21edae82ed19');

        // Démarrer les notifications pour la latence et le débit
        await latencyCharacteristic.startNotifications();
        await throughputCharacteristic.startNotifications();

        latencyCharacteristic.addEventListener('characteristicvaluechanged', notifHandler);
        throughputCharacteristic.addEventListener('characteristicvaluechanged', notifHandler);
      } catch (error) {
        console.log('Error connecting to BLE device: ', error);
      }
    };

    connectBLE();
  }, []);

  return (
    <div>
      <h2>Latency Graph</h2>
      <Line data={{ datasets: [{ data: latencyData, label: 'Latency (ms)', borderColor: 'rgba(75, 192, 192, 1)', fill: false }] }} options={latencyChartOptions} />

      <h2>Throughput Graph</h2>
      <Line data={{ datasets: [{ data: throughputData, label: 'Throughput (bps)', borderColor: 'rgba(153, 102, 255, 1)', fill: false }] }} options={throughputChartOptions} />
    </div>
  );
};

export default P2Pserver;
  
