"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintService = void 0;
const common_1 = require("@nestjs/common");
const escpos = require('escpos');
const USB = require('escpos-usb');
const usbDevice = USB.findPrinter();
if (!usbDevice)
    throw new Error('No se encontró impresora USB');
let PrintService = class PrintService {
    formatLine(name, qty, price) {
        const subtotal = qty * price;
        let n = name.length > 16 ? name.substring(0, 16) : name;
        n = n.padEnd(16, ' ');
        const q = qty.toString().padStart(3, ' ');
        const p = price.toFixed(0).toString().padStart(6, ' ');
        const s = subtotal.toFixed(0).toString().padStart(6, ' ');
        return `${n}${q}${p}${s}`;
    }
    async printFactura(data) {
        try {
            let device;
            const usbDevice = USB.findPrinter();
            if (!usbDevice)
                throw new common_1.BadRequestException('No se encontró impresora USB');
            device = new USB(usbDevice);
            await new Promise((resolve, reject) => {
                device.open((err) => (err ? reject(err) : resolve(null)));
            });
            const printer = new escpos.Printer(device);
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
            return { success: true };
        }
        catch (err) {
            console.error(err);
            throw new common_1.BadRequestException('Error al imprimir: ' + err.message);
        }
    }
};
exports.PrintService = PrintService;
exports.PrintService = PrintService = __decorate([
    (0, common_1.Injectable)()
], PrintService);
//# sourceMappingURL=print.service.js.map