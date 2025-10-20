#!/bin/bash

# Lost & Found Database Seeder
# This script adds fake data to the database for testing

set -e

echo "🌱 Seeding database with fake data..."

# Database connection details
CONTAINER_NAME="lostandfound-db"
DB_NAME="lostandfound"
DB_USER="lostandfound"

# Function to execute SQL
execute_sql() {
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "$1"
}

# Clear existing data (except admin and custodians)
echo "🧹 Clearing existing data..."
execute_sql "DELETE FROM notifications;"
execute_sql "DELETE FROM item_history;"
execute_sql "DELETE FROM pickup_requests;"
execute_sql "DELETE FROM dropoff_requests;"
execute_sql "DELETE FROM messages;"
execute_sql "DELETE FROM items;"
execute_sql "DELETE FROM profiles WHERE role != 'admin';"

# Reset sequences
execute_sql "SELECT setval('profiles_id_seq', (SELECT MAX(id) FROM profiles));"
execute_sql "SELECT setval('items_id_seq', 1, false);"
execute_sql "SELECT setval('messages_id_seq', 1, false);"

# Create sample users
echo "👥 Creating Model Engineering College users..."

# Password hash for "password123" - generated with bcrypt
HASH='$2a$10$gjNHgrfIOq11usBGly4kJ.rB4CDoGdoo.mYGOK0.tdCvPUXNl0Fdy'

execute_sql "INSERT INTO profiles (email, password_hash, full_name, phone, role) VALUES 
('rahul.krishnan@mec.ac.in', '$HASH', 'Rahul Krishnan', '+91 9876543210', 'owner'),
('priya.nair@mec.ac.in', '$HASH', 'Priya Nair', '+91 9876543211', 'owner'),
('aditya.menon@mec.ac.in', '$HASH', 'Aditya Menon', '+91 9876543212', 'finder'),
('anjali.kumar@mec.ac.in', '$HASH', 'Anjali Kumar', '+91 9876543213', 'owner'),
('vishnu.prasad@mec.ac.in', '$HASH', 'Vishnu Prasad', '+91 9876543214', 'finder'),
('sneha.pillai@mec.ac.in', '$HASH', 'Sneha Pillai', '+91 9876543215', 'owner'),
('arjun.sharma@mec.ac.in', '$HASH', 'Arjun Sharma', '+91 9876543216', 'finder'),
('divya.raj@mec.ac.in', '$HASH', 'Divya Raj', '+91 9876543217', 'owner'),
('karthik.iyer@mec.ac.in', '$HASH', 'Karthik Iyer', '+91 9876543218', 'owner'),
('meera.thomas@mec.ac.in', '$HASH', 'Meera Thomas', '+91 9876543219', 'finder'),
('sanjay.reddy@mec.ac.in', '$HASH', 'Sanjay Reddy', '+91 9876543220', 'owner'),
('lakshmi.warrier@mec.ac.in', '$HASH', 'Lakshmi Warrier', '+91 9876543221', 'finder'),
('rohan.das@mec.ac.in', '$HASH', 'Rohan Das', '+91 9876543222', 'owner'),
('kavya.menon@mec.ac.in', '$HASH', 'Kavya Menon', '+91 9876543223', 'finder'),
('abhishek.kumar@mec.ac.in', '$HASH', 'Abhishek Kumar', '+91 9876543224', 'owner');"

echo "📱 Creating lost items..."

# Lost items
execute_sql "INSERT INTO items (user_id, title, description, category, status, location, date_lost_found, image_url, reward_offered) VALUES
(2, 'iPhone 13', 'Black iPhone 13 with MEC student ID card inside the case. Purple silicon case.', 'Phone', 'lost', 'MEC Main Library, 2nd Floor', '2025-10-15', 'https://images.unsplash.com/photo-1678652197834-9c4e07f6e023?w=400', 2000.00),
(3, 'Brown Leather Wallet', 'Brown wallet containing college ID, library card, and some cash. Name: Rahul.', 'Wallet', 'lost', 'CAD Lab, CS Department', '2025-10-18', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 500.00),
(5, 'Navy Blue Backpack', 'Navy blue backpack with laptop, notebooks, and calculator inside. Has a Kerala flag keychain.', 'Bags', 'lost', 'Mechanical Engineering Block', '2025-10-17', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 1500.00),
(2, 'Casio Scientific Calculator', 'Casio FX-991ES Plus calculator with name written on back. Essential for exams!', 'Electronics', 'lost', 'Main Auditorium', '2025-10-14', 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400', 800.00),
(7, 'Bike Lock Key', 'Silver bike lock key with red keychain. Hero bicycle still locked at cycle stand near hostel.', 'Keys', 'lost', 'MEC Hostel Block A', '2025-10-19', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 300.00),
(3, 'HP Laptop', 'HP Pavilion 15 laptop with CS department stickers. Contains semester project files.', 'Electronics', 'lost', 'Cafeteria Area', '2025-10-16', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 3000.00),
(9, 'Engineering Drawing Kit', 'Complete Camlin drawing kit in black box. Has compass, rulers, and protractor.', 'Other', 'lost', 'Civil Engineering Drawing Hall', '2025-10-15', 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400', 600.00),
(11, 'MEC Football Jersey', 'Red MEC football team jersey with number 10. Left in sports complex locker room.', 'Clothing', 'lost', 'Sports Complex', '2025-10-18', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400', 400.00),
(13, 'OnePlus Nord Phone', 'Blue OnePlus Nord 2 with cracked back. Has family photos, very important!', 'Phone', 'lost', 'EEE Lab 3', '2025-10-16', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 1500.00),
(9, 'Engineering Textbooks', 'Set of 3 books: Strength of Materials, Thermodynamics, and Machine Design.', 'Documents', 'lost', 'Near Canteen', '2025-10-17', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 1200.00);"

echo "🔍 Creating found items..."

# Found items
execute_sql "INSERT INTO items (user_id, title, description, category, status, location, date_lost_found, image_url) VALUES
(4, 'Student ID Card', 'MEC student ID card for ECE 3rd year student. Name starts with A.', 'Documents', 'found', 'Electronics Lab, ECE Block', '2025-10-17', 'https://images.unsplash.com/photo-1589395937772-57ccd6b7b7b5?w=400'),
(6, 'Fastrack Watch', 'Black strap analog watch, Fastrack brand. Found near basketball court.', 'Jewelry', 'found', 'Sports Complex', '2025-10-18', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400'),
(8, 'Red Umbrella', 'Red folding umbrella with wooden handle. Found in classroom.', 'Other', 'found', 'Room 301, Main Block', '2025-10-19', 'https://images.unsplash.com/photo-1590556409454-282d00650b42?w=400'),
(5, 'Prescription Glasses', 'Black frame glasses in brown case. Found on library table.', 'Other', 'found', 'MEC Library Reading Room', '2025-10-15', 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400'),
(10, 'Engineering Notebooks', 'Set of 3 classmate notebooks with notes. Subject: Control Systems.', 'Documents', 'found', 'EEE Department Classroom', '2025-10-14', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400'),
(6, 'Wired Earphones', 'White wired earphones with mic. Found tangled near computer lab.', 'Electronics', 'found', 'IT Department Lab 2', '2025-10-18', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'),
(4, 'Blue Denim Jacket', 'Blue denim jacket, size M. Found in auditorium after tech fest.', 'Clothing', 'found', 'Main Auditorium', '2025-10-16', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400'),
(12, 'Wildcraft Backpack', 'Grey Wildcraft backpack with physics textbook inside (HC Verma).', 'Bags', 'found', 'MEC Bus Stop', '2025-10-17', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400'),
(10, 'Hostel Room Key', 'Silver key with room number tag B-204. Block B hostel.', 'Keys', 'found', 'Near Hostel Mess', '2025-10-19', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400'),
(14, 'Milton Water Bottle', 'Blue Milton 1 liter water bottle with MEC sticker on it.', 'Other', 'found', 'Workshop Area', '2025-10-18', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400'),
(5, 'Green Dupatta', 'Green cotton dupatta with embroidery. Found on bench near library.', 'Clothing', 'found', 'MEC Campus Garden', '2025-10-16', 'https://images.unsplash.com/photo-1610470427940-e3aquote3af2b9e?w=400'),
(12, 'SanDisk Pendrive', 'Sandisk 32GB USB pendrive. Might contain important project files.', 'Electronics', 'found', 'Computer Lab, CS Department', '2025-10-19', 'https://images.unsplash.com/photo-1588636142477-cc76f8a283b2?w=400'),
(8, 'Camlin Geometry Box', 'Camlin geometry box with all instruments. Found in drawing hall.', 'Other', 'found', 'Mechanical Drawing Hall', '2025-10-17', 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400'),
(14, 'Lab Manual', 'Electrical Machines lab manual with completed experiments. Name: Priya on first page.', 'Documents', 'found', 'EEE Lab', '2025-10-15', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400'),
(6, 'Titan Watch', 'Silver Titan wristwatch with brown leather strap. Found in library.', 'Jewelry', 'found', 'Main Library', '2025-10-19', 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400'),
(4, 'Engineering Calculator', 'Casio fx-82MS scientific calculator. Found under desk in exam hall.', 'Electronics', 'found', 'Exam Hall 1', '2025-10-18', 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400');"

echo "📝 Creating item history..."

# Add history for some items
execute_sql "INSERT INTO item_history (item_id, action, performed_by, details) 
SELECT id, 'Item reported as ' || status, user_id, 'Created by user' 
FROM items;"

echo "💬 Creating sample messages..."

# Add some messages between users
execute_sql "INSERT INTO messages (sender_id, receiver_id, item_id, message_text, status) VALUES
(4, 2, 1, 'Hi, I think I may have seen your iPhone. Can you describe the stickers on the case?', 'read'),
(2, 4, 1, 'Yes! There is a coffee cup sticker and a mountain sticker. Do you have it?', 'read'),
(5, 3, 2, 'I found a wallet matching your description at the subway. What name is on the ID?', 'delivered'),
(6, 2, 4, 'I found a wedding ring at the library. Does it have any inscription?', 'sent'),
(8, 3, 6, 'I have a Macbook that was left at a coffee shop. Is it a 16-inch model?', 'sent');"

echo "🔔 Creating notifications..."

# Add notifications
execute_sql "INSERT INTO notifications (user_id, title, message, type, related_item_id) VALUES
(2, 'New Message', 'You have a message about your lost iPhone 14 Pro', 'message', 1),
(3, 'New Message', 'Someone found a wallet matching your description', 'message', 2),
(2, 'Possible Match', 'A found item might match your Gold Wedding Ring', 'match', 4),
(3, 'New Message', 'You have a message about your lost Macbook Pro', 'message', 6);"

echo ""
echo "✅ Database seeded successfully!"
echo ""
echo "📊 Summary:"
execute_sql "SELECT COUNT(*) as total_users FROM profiles;" | grep -E "^\s*[0-9]+" | xargs echo "Users:"
execute_sql "SELECT COUNT(*) as total_items FROM items;" | grep -E "^\s*[0-9]+" | xargs echo "Items:"
execute_sql "SELECT COUNT(*) as lost_items FROM items WHERE status = 'lost';" | grep -E "^\s*[0-9]+" | xargs echo "Lost items:"
execute_sql "SELECT COUNT(*) as found_items FROM items WHERE status = 'found';" | grep -E "^\s*[0-9]+" | xargs echo "Found items:"
execute_sql "SELECT COUNT(*) as total_messages FROM messages;" | grep -E "^\s*[0-9]+" | xargs echo "Messages:"
echo ""
echo "🔑 Test user credentials:"
echo "   Email: rahul.krishnan@mec.ac.in"
echo "   Password: password123"
echo ""
echo "   All Model Engineering College users use password: password123"
echo "   Email format: firstname.lastname@mec.ac.in"
