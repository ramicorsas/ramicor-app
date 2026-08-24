-- RAMICOR · Migración v8
-- Cómo le pagamos al chofer (Efectivo/Transferencia/Mercado Pago/Otro) y un
-- comprobante adjunto opcional (foto o captura), guardado como base64 —
-- no usamos storage externo, así que ojo con no subir archivos gigantes
-- (se recomienda una foto liviana, no el original de la cámara sin comprimir).

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS chofer_pago_metodo TEXT, -- Efectivo | Transferencia | Mercado Pago | Otro
  ADD COLUMN IF NOT EXISTS chofer_pago_comprobante TEXT; -- imagen/PDF en base64 (data URI)
