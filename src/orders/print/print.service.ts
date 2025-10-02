// src/print/print.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
const escpos = require('escpos');
const USB = require('escpos-usb');
const Network = require('escpos-network');

@Injectable()
export class PrintService {
  
  // Formatear línea de productos
  private formatLine(name: string, qty: number, price: number): string {
    const subtotal = qty * price;
    let n = name.length > 16 ? name.substring(0, 16) : name;
    n = n.padEnd(16, ' ');

    const q = qty.toString().padStart(3, ' ');
    const p = price.toFixed(0).toString().padStart(6, ' ');
    const s = subtotal.toFixed(0).toString().padStart(6, ' ');

    return `${n}${q}${p}${s}`;
  }

  // Función para imprimir factura/ticket
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
    ip?: string; // opcional para impresora de red
  }) {
    try {
      let device: any;

      // Seleccionar impresora
      if (data.ip) {
        // Impresora de red
        device = new Network(data.ip, 9100);
      } else {
        // Impresora USB
        const usbDevice = USB.findPrinter();
        if (!usbDevice) throw new BadRequestException('No se encontró impresora USB');
        device = new USB(usbDevice);
      }

      // Abrir dispositivo usando Promise
      await new Promise((resolve, reject) => {
        device.open((err: any) => (err ? reject(err) : resolve(null)));
      });

      const printer = new escpos.Printer(device);

      // Encabezado
      printer.align('CT').style('B').text(data.header || 'FACTURA / PEDIDO');
      printer.text('------------------------------');

      // Datos cliente
      printer.align('LT');
      printer.text(`Cliente: ${data.nombre} ${data.apellido}`);
      printer.text(`Dirección: ${data.direccion}`);
      printer.text(`Teléfono: ${data.telefono}`);
      printer.text(`Email: ${data.email}`);
      printer.text(`Método de pago: ${data.pago}`);
      printer.text(`Fecha: ${new Date().toLocaleString()}`);
      printer.text('------------------------------');

      // Tabla de productos
      printer.text('Producto         Qty  P.Unit  Total');
      printer.text('------------------------------');
      data.carrito.forEach(item => {
        printer.text(this.formatLine(item.name, item.cantidad, item.price));
      });
      printer.text('------------------------------');

      // Total
      const total = data.carrito.reduce((sum, i) => sum + i.cantidad * i.price, 0);
      printer.align('RT').style('B').text(`Total: $${total.toFixed(0)}`);

      // Pie
      printer.align('CT').text(data.footer || 'Gracias por su compra!');

      // Cortar papel y cerrar
      printer.cut().close();

      return { success: true };
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Error al imprimir: ' + err.message);
    }
  }
}
