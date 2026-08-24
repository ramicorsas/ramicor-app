-- RAMICOR · Migración v7
-- Separa dos conceptos que estaban mezclados bajo "Cobrado":
--   1) metodo_pago: cómo paga el CLIENTE (Efectivo/Tarjeta/Transferencia) —
--      lo elige el cliente al pedir, y es lo único de plata que ve el chofer.
--   2) monto_chofer + chofer_pago_confirmado: lo que a EL le corresponde
--      cobrar por el viaje, y si ya se lo pagamos — totalmente aparte de la
--      cotización total que le cobramos al cliente (eso sigue siendo
--      información solo del admin, vía "cotizacion" + estado "Cobrado").

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS metodo_pago TEXT, -- Efectivo | Tarjeta | Transferencia
  ADD COLUMN IF NOT EXISTS monto_chofer NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS chofer_pago_confirmado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS chofer_pago_confirmado_en TIMESTAMPTZ;
