import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useStyles, StyleTheme } from '../../hooks/useStyles';

interface SignaturePadProps {
  onSave: (base64: string) => void;
  onCancel: () => void;
}

const CANVAS_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; overflow: hidden; touch-action: none; }
  canvas { display: block; width: 100%; height: 200px; border: 1px solid #ccc; border-radius: 8px; background: #fff; }
</style>
</head>
<body>
<canvas id="sig" height="200"></canvas>
<script>
  var canvas = document.getElementById('sig');
  var ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 200;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000';
  var drawing = false;
  var lastX = 0, lastY = 0;

  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', function(e) {
    drawing = true;
    var p = getPos(e);
    lastX = p.x; lastY = p.y;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener('pointermove', function(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener('pointerup', function() { drawing = false; });
  canvas.addEventListener('pointerleave', function() { drawing = false; });

  window.clearCanvas = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  window.saveCanvas = function() {
    var data = canvas.toDataURL('image/png');
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signature', data: data }));
  };
</script>
</body>
</html>
`;

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const s = useStyles(createStyles);
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'signature' && msg.data) {
        onSave(msg.data);
      }
    } catch {
      // ignore parse errors
    }
  };

  return (
    <View style={s.overlay}>
      <View style={s.container}>
        <Text style={s.title}>Firma del Piloto</Text>
        <Text style={s.subtitle}>Dibuje su firma en el recuadro</Text>

        <View style={s.canvasContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: CANVAS_HTML }}
            style={s.webview}
            scrollEnabled={false}
            bounces={false}
            onMessage={handleMessage}
            javaScriptEnabled
          />
        </View>

        <View style={s.buttons}>
          <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
            <Text style={s.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.clearBtn}
            onPress={() => webViewRef.current?.injectJavaScript('window.clearCanvas(); true;')}
          >
            <Text style={s.clearBtnText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.saveBtn}
            onPress={() => webViewRef.current?.injectJavaScript('window.saveCanvas(); true;')}
          >
            <Text style={s.saveBtnText}>Firmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (t: StyleTheme) => ({
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 999,
    padding: t.spacing.md,
  },
  container: {
    width: '100%' as const,
    backgroundColor: t.colors.surface1,
    borderRadius: t.borderRadius.xl,
    padding: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  title: {
    color: t.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center' as const,
    marginTop: t.spacing.xs,
    marginBottom: t.spacing.md,
  },
  canvasContainer: {
    height: 202,
    borderRadius: t.borderRadius.md,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row' as const,
    gap: t.spacing.sm,
    marginTop: t.spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surface3,
    alignItems: 'center' as const,
  },
  cancelBtnText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surface3,
    alignItems: 'center' as const,
  },
  clearBtnText: {
    color: t.colors.warning,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.primary,
    alignItems: 'center' as const,
  },
  saveBtnText: {
    color: t.colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700' as const,
  },
});
