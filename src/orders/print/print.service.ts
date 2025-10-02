// src/orders/print.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import * as escpos from 'escpos';
const USB = require('escpos-usb'); // ⚠ recommended para evitar errores de constructor
const Network = require('escpos-network');

@Injectable()
export class PrintService {
  
  private formatLine(name: string, qty: number, price: number) {
    const subtotal = qty * price;
    let n = name.length > 16 ? name.substring(0, 16) : name;
    n = n.padEnd(16, ' ');

    const q = qty.toString().padStart(3, ' ');
    const p = price.toFixed(0).toString().padStart(6, ' ');
    const s = subtotal.toFixed(0).toString().padStart(6, ' ');

    return `${n}${q}${p}${s}`;
  }

  async printFactura(data: {
    header?: string;
    nombre: string;
    apellido: string;
    direccion: string;
    telefono: string;
    email: string;
    pago: string;
    carrito: { name: string; cantidad: number; price: number }[];
    footer?: string;
    ip?: string;
  }) {
    try {
      let device: any;

      if (data.ip) {
        device = new Network(data.ip, 9100); // impresora de red
      } else {
        // Buscar impresora USB
        const usbDevice = USB.findPrinter(); 
        if (!usbDevice) throw new BadRequestException('No se encontró impresora USB');
        device = new USB(usbDevice);
      }

      const printer = new escpos.Printer(device);

      // Abrir conexión
      device.open(() => {
        printer.align('CT').style('B').text(data.header || 'FACTURA / PEDIDO');
        printer.text('------------------------------');

        printer.align('LT');
        printer.text(`Cliente: ${data.nombre} ${data.apellido}`);
        printer.text(`Dirección: ${data.direccion}`);
        printer.text(`Teléfono: ${data.telefono}`);
        printer.text(`Email: ${data.email}`);
        printer.text(`Método de pago: ${data.pago}`);
        printer.text(`Fecha: ${new Date().toLocaleString()}`);
        printer.text('------------------------------');

        printer.text('Producto         Qty  P.Unit  Total');
        printer.text('------------------------------');
        data.carrito.forEach(item => {
          printer.text(this.formatLine(item.name, item.cantidad, item.price));
        });
        printer.text('------------------------------');

        const total = data.carrito.reduce((sum, i) => sum + i.cantidad * i.price, 0);
        printer.align('RT').style('B').text(`Total: $${total.toFixed(0)}`);

        printer.align('CT').text(data.footer || 'Gracias por su compra!');
        printer.cut().close();
      });

      return { success: true };
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Error al imprimir: ' + err.message);
    }
  }
}
