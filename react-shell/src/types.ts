export interface Screen {
  id: string;
  name: string;
  url: string;
  scope: string;
  module: string;
  route: string;
}

export interface UserData {
  customerId: string;
  email: string;
  role: string;
}

export interface ScreensResponse {
  success: boolean;
  data: {
    tenant: string;
    tenantName?: string;
    screens: Screen[];
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: UserData;
  };
}
