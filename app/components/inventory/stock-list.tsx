import React, { useState } from 'react';

type WritableCharacteristic = {
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValue: (value: BufferSource) => Promise<void>;
};

export default function StockList() {
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState<WritableCharacteristic | null>(null);
  const [status, setStatus] = useState('Disconnected');
  const [loading, setLoading] = useState(false);

  // 1. Connect sa Bluetooth Thermal Printer
  const connectPrinter = async () => {
    try {
      setStatus('Searching for printer...');
      
      // I-scan ang Bluetooth devices. Minsan custom ang UUID ng mga Deli printer,
      // kaya acceptAllDevices: true ang pinaka-safe gamitin.
      const selectedDevice = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard Serial Printer Service
          '0000ff00-0000-1000-8000-00805f9b34fb', // Common Chinese/Deli Printer Service
          '0000e701-0000-1000-8000-00805f9b34fb'
        ]
      });

      setStatus('Connecting to GATT Server...');
      const server = await selectedDevice.gatt.connect();

      // Hanapin ang tamang Service at Characteristic na pwedeng sulatan (Write)
      const services = await server.getPrimaryServices();
      let targetCharacteristic: WritableCharacteristic | null = null;

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            targetCharacteristic = char;
            break;
          }
        }
        if (targetCharacteristic) break;
      }

      if (!targetCharacteristic) {
        throw new Error('No writable characteristic found on this printer.');
      }

      setDevice(selectedDevice);
      setCharacteristic(targetCharacteristic);
      setStatus(`Connected to ${selectedDevice.name || 'Thermal Printer'}`);
    } catch (error) {
      console.error('Bluetooth Connection Error:', error);
      setStatus(`Connection Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // 2. Direct Silent Print Handler (No Popups!)
  const handleTestPrint = async () => {
    if (!characteristic) {
      alert('Kailangan muna i-connect ang printer!');
      return;
    }

    try {
      setLoading(true);
      setStatus('Printing...');

      // ESC/POS Commands (Raw bytes para sa Thermal Printers)
      const encoder = new TextEncoder();
      
      const ESC_INIT = new Uint8Array([0x1b, 0x40]); // Initialize Printer
      const ALIGN_CENTER = new Uint8Array([0x1b, 0x61, 0x01]); // Align Center
      const ALIGN_LEFT = new Uint8Array([0x1b, 0x61, 0x00]); // Align Left
      const TEXT_BOLD_ON = new Uint8Array([0x1b, 0x45, 0x01]); // Bold On
      const TEXT_BOLD_OFF = new Uint8Array([0x1b, 0x45, 0x00]); // Bold Off
      const PAPER_FEED = new Uint8Array([0x1b, 0x64, 0x04]); // Feed 4 lines

      // Content ng Receipt
      const title = encoder.encode('SEAREN SIZZLE POS\n');
      const divider = encoder.encode('--------------------------------\n');
      const body = encoder.encode(
        'Item: Test Order\n' +
        'Qty: 1\n' +
        'Price: PHP 150.00\n' +
        'Status: SILENT PRINT SUCCESS!\n'
      );
      const footer = encoder.encode('Thank you for testing!\n');

      // Pagdugtong-dugtungin ang mga bytes
      const payload = combineUint8Arrays([
        ESC_INIT,
        ALIGN_CENTER,
        TEXT_BOLD_ON,
        title,
        TEXT_BOLD_OFF,
        divider,
        ALIGN_LEFT,
        body,
        divider,
        ALIGN_CENTER,
        footer,
        PAPER_FEED
      ]);

      // I-send ang bytes direkta sa printer via GATT
      await characteristic.writeValue(payload);

      setStatus('Print Success!');
    } catch (error) {
      console.error('Print Error:', error);
      setStatus(`Print Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper Function para pagsamahin ang Byte Arrays
  const combineUint8Arrays = (arrays: Uint8Array[]) => {
    const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Thermal Printer Silent Test</h2>
      <p>Status: <strong>{status}</strong></p>

      {!device ? (
        <button 
          onClick={connectPrinter}
          style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          1. Connect Bluetooth Printer
        </button>
      ) : (
        <button 
          onClick={handleTestPrint}
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Printing...' : '2. Click to Test Print (No Popup)'}
        </button>
      )}
    </div>
  );
}