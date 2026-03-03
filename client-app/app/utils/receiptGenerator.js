import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

/**
 * Generate and download order receipt as PDF
 * @param {Object} order - Order object with all details
 * @param {Object} userInfo - User information (name, phone)
 */
export const generateOrderReceipt = async (order, userInfo) => {
  try {
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = orderDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Receipt - ${order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              background: #ffffff;
              color: #1E293B;
              line-height: 1.3;
              font-size: 10px;
            }
            .receipt-container {
              max-width: 700px;
              margin: 0 auto;
              border: 2px solid #1E3A5F;
              padding: 15px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 10px;
              border-bottom: 2px solid #1E3A5F;
            }
            .company-info {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .company-logo {
              width: 70px;
              height: 70px;
              object-fit: contain;
              flex-shrink: 0;
            }
            .company-text {
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .company-name {
              font-size: 18px;
              font-weight: 800;
              color: #1E3A5F;
              margin-bottom: 3px;
              letter-spacing: 0.5px;
            }
            .company-tagline {
              font-size: 8px;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .receipt-title-block { text-align: right; }
            .receipt-title {
              font-size: 14px;
              font-weight: 700;
              color: #1E3A5F;
              text-align: right;
            }
            .order-id {
              font-size: 9px;
              color: #64748B;
              text-align: right;
              margin-top: 3px;
              font-family: monospace;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding: 8px;
              background: #F8FAFC;
              border-radius: 4px;
            }
            .info-block { flex: 1; }
            .info-label {
              font-size: 7px;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
              font-weight: 600;
            }
            .info-value {
              font-size: 9px;
              color: #1E293B;
              font-weight: 600;
            }
            .items-section { margin-bottom: 12px; }
            .section-title {
              font-size: 10px;
              font-weight: 700;
              color: #1E3A5F;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            thead { background: #1E3A5F; color: white; }
            th {
              padding: 6px 4px;
              text-align: left;
              font-size: 8px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            th:last-child, td:last-child { text-align: right; }
            tbody tr { border-bottom: 1px solid #E2E8F0; }
            tbody tr:last-child { border-bottom: 1.5px solid #1E3A5F; }
            td { padding: 5px 4px; font-size: 9px; color: #1E293B; }
            .item-name { font-weight: 600; }
            .item-price { font-weight: 700; color: #1E3A5F; }
            .payment-summary {
              margin-bottom: 12px;
              padding: 10px;
              background: #F8FAFC;
              border-radius: 4px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 9px;
            }
            .summary-label { color: #64748B; font-weight: 500; }
            .summary-value { color: #1E293B; font-weight: 600; }
            .summary-divider { height: 1px; background: #E2E8F0; margin: 5px 0; }
            .total-row {
              padding: 6px 0;
              border-top: 1.5px solid #1E3A5F;
              margin-top: 5px;
            }
            .total-label { font-size: 11px; font-weight: 700; color: #1E293B; }
            .total-value { font-size: 13px; font-weight: 800; color: #1E3A5F; }
            .address-section { margin-bottom: 12px; }
            .address-box {
              padding: 8px;
              background: #F8FAFC;
              border-radius: 4px;
              font-size: 9px;
              color: #1E293B;
              line-height: 1.4;
            }
            .footer {
              margin-top: 12px;
              padding-top: 10px;
              border-top: 1.5px solid #1E3A5F;
            }
            .company-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              gap: 10px;
            }
            .detail-block { flex: 1; }
            .detail-title {
              font-size: 7px;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 3px;
              font-weight: 600;
            }
            .detail-text { font-size: 8px; color: #1E293B; line-height: 1.4; }
            .notes {
              background: #FEF3C7;
              padding: 8px;
              border-radius: 4px;
              border-left: 3px solid #F59E0B;
              margin-top: 10px;
            }
            .notes-title {
              font-size: 8px;
              font-weight: 700;
              color: #92400E;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .notes-text { font-size: 7px; color: #78350F; line-height: 1.4; }
            .thank-you {
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
              font-weight: 600;
              color: #1E3A5F;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">

            <!-- Header: Logo left, Company name, Receipt title right -->
            <div class="header">
              <div class="company-info">
                <img
                  class="company-logo"
                  src="data:image/jpeg;base64,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"
                  alt="MRS Enterprises Logo"
                />
                <div class="company-text">
                  <div class="company-name">RISWANA ENTERPRISES</div>
                  <div class="company-tagline">Construction Material Supplier</div>
                </div>
              </div>
              <div class="receipt-title-block">
                <div class="receipt-title">ORDER RECEIPT</div>
                <div class="order-id">Order ID: ${order.id?.slice(0, 16)}</div>
              </div>
            </div>

            <!-- Date & Customer Info -->
            <div class="info-section">
              <div class="info-block">
                <div class="info-label">Date &amp; Time</div>
                <div class="info-value">${formattedDate} ${formattedTime}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Customer Name</div>
                <div class="info-value">${userInfo?.name || 'N/A'}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${userInfo?.phone || 'N/A'}</div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="items-section">
              <div class="section-title">Order Details</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 8%;">No</th>
                    <th style="width: 42%;">Item</th>
                    <th style="width: 18%;">Qty</th>
                    <th style="width: 16%;">Rate</th>
                    <th style="width: 16%;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items?.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="item-name">${item.name}</td>
                      <td>${item.quantity} ${item.unit || ''}</td>
                      <td>&#8377;${(item.subtotal / item.quantity).toFixed(2)}</td>
                      <td class="item-price">&#8377;${item.subtotal.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">&#8377;${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">GST (18%)</span>
                <span class="summary-value">&#8377;${order.gst?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row">
                <span class="total-label">Total Amount</span>
                <span class="total-value">&#8377;${order.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <!-- Delivery Address -->
            <div class="address-section">
              <div class="section-title">Delivery Address</div>
              <div class="address-box">
                ${order.deliveryAddress?.fullAddress || 'Chennai, Tamil Nadu 600001'}
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="company-details">
                <div class="detail-block">
                  <div class="detail-title">Address</div>
                  <div class="detail-text">
                    Riswana Enterprises, 123 Construction St,<br>
                    Chennai, Tamil Nadu 600001, India
                  </div>
                </div>
                <div class="detail-block">
                  <div class="detail-title">Contact</div>
                  <div class="detail-text">
                    Email: info@riswanaenterprises.com<br>
                    Phone: +91 98765 43210
                  </div>
                </div>
                <div class="detail-block">
                  <div class="detail-title">Business Details</div>
                  <div class="detail-text">GSTIN: 33XXXXX1234X1ZX</div>
                </div>
              </div>

              <div class="notes">
                <div class="notes-title">&#9888; Important Notes</div>
                <div class="notes-text">
                  Delivery time may vary based on location. Prices subject to change.
                  Verify items upon delivery. This is a computer-generated receipt.
                </div>
              </div>

              <div class="thank-you">Thank you for choosing Riswana Enterprises!</div>
            </div>

          </div>
        </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const fileName = `Riswana_OrderReceipt-${order.id?.slice(0, 8) || 'order'}.pdf`;

    // Android 11+ (API 30+) - Use Storage Access Framework
    if (Platform.OS === 'android') {
      try {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          return {
            success: false,
            error: 'Storage permission denied. Please grant permission to save receipts.',
          };
        }

        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/pdf'
        );

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert(
          'Receipt Downloaded',
          `Receipt saved to Downloads folder as ${fileName}`,
          [{ text: 'OK' }]
        );

        return {
          success: true,
          uri: fileUri,
          message: 'Receipt saved to Downloads folder',
        };
      } catch (error) {
        console.error('Error saving receipt (Android SAF):', error);

        try {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Save or Share Receipt',
              UTI: 'com.adobe.pdf',
            });
            return { success: true, uri, message: 'Receipt shared successfully' };
          }
        } catch (shareError) {
          console.error('Share fallback failed:', shareError);
        }

        return {
          success: false,
          error: 'Failed to save receipt. Please try again.',
        };
      }
    } else if (Platform.OS === 'ios') {
      try {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: 'com.adobe.pdf',
            mimeType: 'application/pdf',
          });
          return { success: true, uri, message: 'Receipt shared successfully' };
        } else {
          return {
            success: false,
            error: 'Sharing is not available on this device',
          };
        }
      } catch (error) {
        console.error('Error sharing receipt (iOS):', error);
        return {
          success: false,
          error: 'Failed to share receipt. Please try again.',
        };
      }
    } else {
      try {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf',
          });
          return { success: true, uri, message: 'Receipt shared successfully' };
        } else {
          return {
            success: false,
            error: 'Sharing is not available on this device',
          };
        }
      } catch (error) {
        console.error('Error sharing receipt:', error);
        return {
          success: false,
          error: 'Failed to share receipt. Please try again.',
        };
      }
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};