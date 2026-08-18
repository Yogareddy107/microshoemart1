
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT TO anon, authenticated USING (active = true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand text NOT NULL DEFAULT '',
  gender text NOT NULL DEFAULT 'unisex',
  original_price numeric(10,2) NOT NULL DEFAULT 0,
  discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
  discount_price numeric(10,2) GENERATED ALWAYS AS (round(original_price * (1 - discount_percentage / 100), 2)) STORED,
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  stock_quantity integer NOT NULL DEFAULT 0,
  images text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_sale boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon, authenticated USING (active = true);
CREATE INDEX products_category_idx ON public.products(category_id);

CREATE TABLE public.advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  starts_at date,
  ends_at date,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.advertisements TO anon, authenticated;
GRANT ALL ON public.advertisements TO service_role;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view running advertisements" ON public.advertisements FOR SELECT TO anon, authenticated
  USING (active = true AND (starts_at IS NULL OR starts_at <= CURRENT_DATE) AND (ends_at IS NULL OR ends_at >= CURRENT_DATE));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE DEFAULT ('MSM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6))),
  customer_name text NOT NULL,
  mobile text NOT NULL,
  whatsapp text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  pincode text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  savings numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'Micro Shoe Mart',
  tagline text NOT NULL DEFAULT 'Step Into Your Style',
  logo_url text,
  whatsapp_number text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  opening_hours text NOT NULL DEFAULT '',
  delivery_info text NOT NULL DEFAULT '',
  policies text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_config TO service_role;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_config (pin) VALUES ('4321');

INSERT INTO public.store_settings (whatsapp_number, instagram_url, address, phone, email, opening_hours, delivery_info, policies)
VALUES ('919959810473', 'https://www.instagram.com/micro__shoe_mart/',
 'RTC Busstand Road, Koilkuntla, Nandyal District, Andhra Pradesh, India - 518134',
 '9959810473', 'microshoemart@gmail.com', 'Monday - Sunday, 9:00 AM to 9:30 PM',
 'Free home delivery inside Koilkuntla on orders above Rs. 999. Courier delivery across Nandyal district in 2-4 working days. Cash on delivery available.',
 'Easy 7-day size exchange with the original bill and unused condition. Manufacturing defects are replaced free of cost. Discounted footwear can be exchanged but not refunded.');

INSERT INTO public.categories (name, slug, description, image_url, display_order) VALUES
 ('Men''s Footwear','mens-footwear','Everyday and occasion shoes for men','/images/shoes/mens-sneaker.jpg',1),
 ('Women''s Footwear','womens-footwear','Heels, flats and bellies for women','/images/shoes/womens-heel.jpg',2),
 ('Kids'' Footwear','kids-footwear','Comfortable school and play shoes for kids','/images/shoes/kids-sneaker.jpg',3),
 ('Sports Shoes','sports-shoes','Running, gym and training shoes','/images/shoes/sports-runner.jpg',4),
 ('Casual Shoes','casual-shoes','Canvas, sneakers and loafers for daily wear','/images/shoes/casual-canvas.jpg',5),
 ('Sandals','sandals','Open sandals for men and women','/images/shoes/mens-sandal.jpg',6),
 ('Slippers','slippers','Soft everyday slippers and flip flops','/images/shoes/slipper.jpg',7),
 ('Formal Shoes','formal-shoes','Office and wedding formals','/images/shoes/formal-brown.jpg',8);

INSERT INTO public.products (name, slug, description, category_id, brand, gender, original_price, discount_percentage, sizes, colors, stock_quantity, images, featured, is_new, is_sale)
SELECT v.name, v.slug, v.description, c.id, v.brand, v.gender, v.original_price, v.discount_percentage, v.sizes, v.colors, v.stock, v.images, v.featured, v.is_new, v.is_sale
FROM (VALUES
 ('Velocity Street Runner','velocity-street-runner','A lightweight mesh running shoe with a cushioned EVA midsole and grippy rubber outsole. Built for morning runs and long walking days in equal measure.','sports-shoes','Micro Active','men',2499,25,ARRAY['6','7','8','9','10'],ARRAY['Black','Grey','Blue'],24,ARRAY['/images/shoes/sports-runner.jpg','/images/shoes/mens-sneaker.jpg'],true,true,true),
 ('Classic Oxford Brown Formal','classic-oxford-brown-formal','Hand-finished leather Oxford with a stitched welt sole. The office-to-wedding shoe that keeps its shine for years.','formal-shoes','Micro Signature','men',2999,20,ARRAY['6','7','8','9','10','11'],ARRAY['Brown','Black'],16,ARRAY['/images/shoes/formal-brown.jpg'],true,false,true),
 ('Metro Canvas Sneaker','metro-canvas-sneaker','Breathable cotton canvas upper on a vulcanised rubber sole. An easy pairing with jeans, chinos or shorts.','casual-shoes','Micro Everyday','unisex',1299,30,ARRAY['5','6','7','8','9','10'],ARRAY['White','Navy','Olive'],40,ARRAY['/images/shoes/casual-canvas.jpg'],true,true,true),
 ('Aria Block Heel','aria-block-heel','A 2.5 inch block heel with a padded insole and soft strap lining, steady enough to wear all evening.','womens-footwear','Micro Bella','women',1899,15,ARRAY['4','5','6','7','8'],ARRAY['Beige','Black','Maroon'],18,ARRAY['/images/shoes/womens-heel.jpg'],true,true,false),
 ('Petal Ballerina Flats','petal-ballerina-flats','Slip-on bellies with memory foam cushioning and a flexible anti-skid sole for all-day college and office wear.','womens-footwear','Micro Bella','women',999,20,ARRAY['4','5','6','7','8'],ARRAY['Pink','Black','Tan'],32,ARRAY['/images/shoes/womens-flat.jpg'],false,false,true),
 ('Junior Bounce School Sneaker','junior-bounce-school-sneaker','Easy hook-and-loop straps, washable upper and a shock-absorbing sole made for playgrounds and school corridors.','kids-footwear','Micro Kids','kids',899,10,ARRAY['10','11','12','13','1','2'],ARRAY['Blue','Red','White'],28,ARRAY['/images/shoes/kids-sneaker.jpg'],true,true,false),
 ('Trail Grip Sports Sandal','trail-grip-sports-sandal','Adjustable dual-strap sandal with a moulded footbed and high-traction outsole for travel and long walks.','sandals','Micro Active','men',1099,25,ARRAY['6','7','8','9','10'],ARRAY['Black','Brown'],26,ARRAY['/images/shoes/mens-sandal.jpg'],false,false,true),
 ('Cloudstep Home Slipper','cloudstep-home-slipper','Ultra-soft EVA slipper that stays light and dries fast, with a textured footbed for grip on wet floors.','slippers','Micro Comfort','unisex',499,20,ARRAY['5','6','7','8','9','10'],ARRAY['Grey','Navy','Black'],60,ARRAY['/images/shoes/slipper.jpg'],false,true,true),
 ('Urban Court Sneaker','urban-court-sneaker','A clean court-style sneaker in textured faux leather with a cupsole and padded collar for everyday comfort.','mens-footwear','Micro Everyday','men',1799,15,ARRAY['6','7','8','9','10'],ARRAY['White','Black'],22,ARRAY['/images/shoes/mens-sneaker.jpg'],true,false,false),
 ('Heritage Slip-On Loafer','heritage-slip-on-loafer','Soft synthetic leather loafer with a stitched apron and lightly cushioned insole. Smart without being stiff.','mens-footwear','Micro Signature','men',2199,20,ARRAY['6','7','8','9','10','11'],ARRAY['Tan','Black'],14,ARRAY['/images/shoes/loafer.jpg'],false,true,true),
 ('Studio Training Shoe','studio-training-shoe','Flat-base training shoe with a wide toe box and firm heel for gym sessions, lifting and functional workouts.','sports-shoes','Micro Active','unisex',2299,20,ARRAY['5','6','7','8','9','10'],ARRAY['Black','Teal'],0,ARRAY['/images/shoes/training.jpg'],false,false,true),
 ('Breeze Everyday Flip Flop','breeze-everyday-flip-flop','Lightweight flip flop with soft toe post lining and a contoured sole that stays comfortable all summer.','slippers','Micro Comfort','women',399,10,ARRAY['4','5','6','7','8'],ARRAY['Pink','Grey'],45,ARRAY['/images/shoes/flipflop.jpg'],false,false,false)
) AS v(name, slug, description, cat_slug, brand, gender, original_price, discount_percentage, sizes, colors, stock, images, featured, is_new, is_sale)
JOIN public.categories c ON c.slug = v.cat_slug;

INSERT INTO public.advertisements (title, message, link, active, display_order) VALUES
 ('Season Sale','FLAT 30% OFF on casual sneakers this week only', '/shop', true, 1),
 ('New Arrivals','Fresh monsoon arrivals just landed in store', '/shop', true, 2),
 ('Free Delivery','Free home delivery in Koilkuntla on orders above Rs. 999', null, true, 3),
 ('Order on WhatsApp','Order on WhatsApp and get your size reserved instantly', null, true, 4);
