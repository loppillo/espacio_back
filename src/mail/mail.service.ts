import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private isConfigured: boolean;

  constructor() {
    // Verificar si las credenciales están configuradas
    const hasCredentials = process.env.MAIL_USER && process.env.MAIL_PASSWORD;

    if (hasCredentials) {
      const port = parseInt(process.env.MAIL_PORT) || 587;
      const isSecure = process.env.MAIL_IS_SECURE === 'true' || port === 465;

      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: port,
        secure: isSecure, // true para 465 (SSL/TLS), false para 587 (STARTTLS)
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      this.isConfigured = true;
      console.log('✅ Servicio de email configurado correctamente');
      console.log(`📧 Host: ${process.env.MAIL_HOST}, Puerto: ${port}, Secure: ${isSecure}`);
    } else {
      this.isConfigured = false;
      console.warn('⚠️ Servicio de email NO configurado - Agrega MAIL_USER y MAIL_PASSWORD en tu archivo .env');
    }
  }

  async sendOrderConfirmation(orderData: {
    customerEmail: string;
    customerName: string;
    numeroVenta: number;
    fecha: string;
    orderType: string;
    customerAddress?: string;
    tiempoEstimado?: string;
    products: Array<{ name: string; cantidad: number; price: number }>;
    subtotal: number;
    costoEnvio: number;
    total: number;
  }) {
    // Si no está configurado, salir sin error
    if (!this.isConfigured) {
      console.log('⚠️ Email no enviado - servicio no configurado. Crea un archivo .env con las variables MAIL_*');
      return;
    }

    const {
      customerEmail,
      customerName,
      numeroVenta,
      fecha,
      orderType,
      customerAddress,
      tiempoEstimado,
      products,
      subtotal,
      costoEnvio,
      total,
    } = orderData;

    // Generar la tabla de productos
    const productRows = products
      .map(
        (p) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">(${p.cantidad}) ${p.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$ ${p.price.toLocaleString('es-CL')}</td>
        </tr>
      `,
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #ff6600;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .info-section {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 600;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .products-table th {
      background-color: #f0f0f0;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      color: #555;
    }
    .products-table td {
      padding: 8px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #333;
    }
    .totals {
      margin-top: 20px;
      padding: 15px 0;
      border-top: 2px solid #eee;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .total-row.final {
      font-weight: 700;
      font-size: 16px;
      color: #ff6600;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      margin-top: 10px;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Pedido confirmado!</h1>
    </div>
    
    <div class="content">
      <p class="greeting">
        Hola <strong>${customerName}</strong>, tu pedido fue confirmado y está próximo a prepararse.
      </p>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Pedido:</span>
          <span class="info-value">#${numeroVenta}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha:</span>
          <span class="info-value">${fecha}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tipo:</span>
          <span class="info-value">${orderType === 'delivery' ? 'Envío a domicilio' : orderType}</span>
        </div>
        ${customerAddress
        ? `
        <div class="info-row">
          <span class="info-label">Dirección:</span>
          <span class="info-value">${customerAddress}</span>
        </div>
        `
        : ''
      }
        ${tiempoEstimado
        ? `
        <div class="info-row">
          <span class="info-label">Tiempo estimado:</span>
          <span class="info-value">${tiempoEstimado}</span>
        </div>
        `
        : ''
      }
      </div>

      <table class="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align: right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>$ ${subtotal.toLocaleString('es-CL')}</span>
        </div>
        <div class="total-row">
          <span>Costo de envío</span>
          <span>$ ${costoEnvio.toLocaleString('es-CL')}</span>
        </div>
        <div class="total-row final">
          <span>Total</span>
          <span>$ ${total.toLocaleString('es-CL')}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Gracias por tu preferencia.</p>
      <p>Este es un correo automático, por favor no responder.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: customerEmail,
        subject: `¡Pedido confirmado! #${numeroVenta}`,
        html: htmlContent,
      });
      console.log(`✅ Email enviado a ${customerEmail}`);
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      // No lanzamos error para no interrumpir la creación de la orden
    }
  }
}
