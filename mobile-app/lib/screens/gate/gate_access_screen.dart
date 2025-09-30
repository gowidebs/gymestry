import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../utils/app_theme.dart';

class GateAccessScreen extends StatefulWidget {
  @override
  _GateAccessScreenState createState() => _GateAccessScreenState();
}

class _GateAccessScreenState extends State<GateAccessScreen> {
  String _qrData = '';
  int _selectedMethod = 0;

  @override
  void initState() {
    super.initState();
    _generateQRCode();
  }

  void _generateQRCode() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    setState(() {
      _qrData = 'GYMESTRY_ACCESS_${timestamp}_USER123';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Gate Access'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            _buildMethodSelector(),
            SizedBox(height: 20),
            Expanded(
              child: _buildAccessMethod(),
            ),
            _buildAccessButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildMethodSelector() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Access Method',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMethodOption(0, 'QR Code', Icons.qr_code),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: _buildMethodOption(1, 'Bluetooth', Icons.bluetooth),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: _buildMethodOption(2, 'Face Scan', Icons.face),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMethodOption(int index, String title, IconData icon) {
    final isSelected = _selectedMethod == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = index),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryRed : AppTheme.lightGrey,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? AppTheme.white : AppTheme.grey,
              size: 24,
            ),
            SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                color: isSelected ? AppTheme.white : AppTheme.grey,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccessMethod() {
    switch (_selectedMethod) {
      case 0:
        return _buildQRMethod();
      case 1:
        return _buildBluetoothMethod();
      case 2:
        return _buildFaceMethod();
      default:
        return _buildQRMethod();
    }
  }

  Widget _buildQRMethod() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'QR Code Access',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 20),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.lightGrey),
              ),
              child: QrImageView(
                data: _qrData,
                version: QrVersions.auto,
                size: 200.0,
                foregroundColor: AppTheme.darkGrey,
              ),
            ),
            SizedBox(height: 20),
            Text(
              'Scan this QR code at the gym gate',
              style: TextStyle(
                color: AppTheme.grey,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 12),
            TextButton(
              onPressed: _generateQRCode,
              child: Text('Refresh QR Code'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBluetoothMethod() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.bluetooth_searching,
              size: 80,
              color: AppTheme.primaryRed,
            ),
            SizedBox(height: 20),
            Text(
              'Bluetooth Access',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            Text(
              'Walk near the gate and tap "Connect" to unlock via Bluetooth',
              style: TextStyle(
                color: AppTheme.grey,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFaceMethod() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.face_retouching_natural,
              size: 80,
              color: AppTheme.primaryRed,
            ),
            SizedBox(height: 20),
            Text(
              'Facial Recognition',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            Text(
              'Position your face in front of the camera at the gate for recognition',
              style: TextStyle(
                color: AppTheme.grey,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccessButton() {
    String buttonText;
    switch (_selectedMethod) {
      case 1:
        buttonText = 'Connect via Bluetooth';
        break;
      case 2:
        buttonText = 'Start Face Recognition';
        break;
      default:
        buttonText = 'Show QR at Gate';
    }

    return Container(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _handleAccess,
        child: Text(buttonText),
      ),
    );
  }

  void _handleAccess() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Access method activated'),
        backgroundColor: AppTheme.primaryRed,
      ),
    );
  }
}