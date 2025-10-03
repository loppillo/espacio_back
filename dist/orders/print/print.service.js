"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintService = void 0;
const common_1 = require("@nestjs/common");
const node_thermal_printer_1 = __importDefault(require("node-thermal-printer"));
let PrintService = class PrintService {
    async printFactura(data) {
        try {
            const printer = new node_thermal_printer_1.default.printer({
                type: node_thermal_printer_1.default.types.EPSON,
                interface: data.ip ? `tcp://${data.ip}` : 'usb',
                options: {
                    timeout: 5000,
                },
            });
            const isConnected = await printer.isPrinterConnected();
            if (!isConnected) {
                throw new common_1.BadRequestException('No se pudo conectar con la impresora');
            }
            printer.alignCenter();
            printer.println(data.header || 'FACTURA / PEDIDO');
            printer.drawLine();
            printer.alignLeft();
            printer.println(`Cliente: ${data.nombre} ${data.apellido}`);
            printer.println(`Dirección: ${data.direccion}`);
            printer.println(`Teléfono: ${data.telefono}`);
            printer.println(`Email: ${data.email}`);
            printer.println(`Método de pago: ${data.pago}`);
            printer.println(`Fecha: ${new Date().toLocaleString()}`);
            printer.drawLine();
            printer.println('Producto              Cant  Precio  Total');
            printer.drawLine();
            data.carrito.forEach((item) => {
                const total = item.cantidad * item.price;
                printer.println(`${item.name.padEnd(18)} ${item.cantidad
                    .toString()
                    .padStart(3)} ${item.price.toString().padStart(6)} ${total
                    .toString()
                    .padStart(6)}`);
            });
            printer.drawLine();
            const total = data.carrito.reduce((sum, i) => sum + i.cantidad * i.price, 0);
            printer.alignRight();
            printer.println(`TOTAL: $${total}`);
            printer.alignCenter();
            printer.println(data.footer || 'Gracias por su compra!');
            printer.cut();
            await printer.execute();
            return { success: true };
        }
        catch (err) {
            console.error('Error de impresión:', err);
            throw new common_1.BadRequestException('Error al imprimir: ' + err.message);
        }
    }
};
exports.PrintService = PrintService;
exports.PrintService = PrintService = __decorate([
    (0, common_1.Injectable)()
], PrintService);
//# sourceMappingURL=print.service.js.map