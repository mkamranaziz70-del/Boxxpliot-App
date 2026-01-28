export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  Customers: undefined;
  CreateCustomer: {
    customer?: any;
  };
  EmployeeNotifications: undefined;

  JobDetail: {
    jobId: string;
  };

  EmployeeJobDetail: {
    jobId: string;
  };

  EmployeeTasks: undefined;

  AssignTeam: {
    jobId: string;
  };

  Employees: undefined;
  AddEmployee: undefined;

  QuotationsList: undefined;

  CreateQuote:
    | {
        id?: string; 
      }
    | undefined;

  QuotationDetails: {
    id: string;
  };
};
