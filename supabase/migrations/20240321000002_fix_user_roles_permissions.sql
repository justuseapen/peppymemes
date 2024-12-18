-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Temporarily disable RLS to ensure it's not interfering
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT ON user_roles TO authenticated;

-- Verify the admin role exists for your user
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'justuseapen@gmail.com'
AND NOT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.users.id
);
