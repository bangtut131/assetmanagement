-- Copy this file content.
-- Go to Supabase Dashboard -> SQL Editor.
-- Paste and Run to insert default users.

insert into public.users (id, username, password, name, role, status)
values
('u1', 'admin', '123', 'Super Administrator', 'SUPER_ADMIN', 'active'),
('u2', 'manager', '123', 'Operations Manager', 'MANAGER', 'active'),
('u3', 'staff', '123', 'Staff Member', 'STAFF', 'active'),
('u4', 'auditor', '123', 'External Auditor', 'AUDITOR', 'active'),
('u5', 'viewer', '123', 'Guest Viewer', 'VIEWER', 'active')
on conflict (id) do nothing;

-- Values for initial Locations (Optional)
insert into public.locations (id, name, parent_id)
values
('loc1', 'Kantor Pusat', null),
('loc2', 'Lantai 1', 'loc1'),
('loc3', 'Ruang Server', 'loc2'),
('loc4', 'Lantai 2', 'loc1'),
('loc5', 'Ruang CEO', 'loc4'),
('loc6', 'Gudang Logistik', null)
on conflict (id) do nothing;

-- Values for initial Assets (Optional)
insert into public.assets (id, name, category, location_id, price, purchase_date, useful_life, status, barcode, image)
values
('1', 'MacBook Pro M2', 'Elektronik', 'loc3', 24000000, '2023-05-12', 4, 'Baik', 'MBP2023001', null),
('2', 'Kursi Ergonomis Herman Miller', 'Furniture', 'loc5', 18000000, '2022-11-20', 8, 'Baik', 'HM2022099', null),
('3', 'Forklift Toyota', 'Mesin', 'loc6', 85000000, '2021-03-10', 10, 'Perbaikan', 'FORK210055', null)
on conflict (id) do nothing;
