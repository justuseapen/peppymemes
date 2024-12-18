-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Create a new policy that allows users to view their own role
CREATE POLICY "Users can view their own role"
    ON user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Also allow admins to view all roles
CREATE POLICY "Admins can view all roles"
    ON user_roles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );
