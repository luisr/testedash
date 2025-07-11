import { storage } from './server/storage';

async function setupSuperUser() {
  console.log('🔄 Setting up super user...');
  
  try {
    // Update Luis to be a super user
    const updatedUser = await storage.updateUser(5, { isSuperUser: true });
    
    if (updatedUser) {
      console.log('✅ Super user setup completed!');
      console.log('Super user details:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isSuperUser: updatedUser.isSuperUser
      });
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error setting up super user:', error);
  }
}

setupSuperUser();