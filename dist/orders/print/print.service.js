"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintService = void 0;
const common_1 = require("@nestjs/common");
const escpos = __importStar(require("escpos"));
const USB = __importStar(require("escpos-usb"));
const Network = __importStar(require("escpos-network"));
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
            if (data.ip) {
                device = new Network(data.ip, 9100);
            }
            else {
                const usbDevice = USB.findPrinter();
                if (!usbDevice)
                    throw new common_1.BadRequestException('No se encontró impresora USB');
                device = new USB(usbDevice);
            }
            const printer = new escpos.Printer(device);
            device.open(() => {
                if (data.header) {
                    printer.align('CT').style('B').text(data.header);
                    printer.text('------------------------------');
                }
                else {
                    printer.align('CT').style('B').text('FACTURA / PEDIDO');
                    printer.text('------------------------------');
                }
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
                if (data.footer)
                    printer.align('CT').text(data.footer);
                else
                    printer.align('CT').text('Gracias por su compra!');
                printer.cut().close();
            });
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