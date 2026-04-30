import jwt from 'jsonwebtoken';

const generateToken = (id: string, role: string, workspaceId: string) => {
  return jwt.sign({ id, role, workspaceId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export default generateToken;
