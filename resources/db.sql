INSERT INTO Currency (Id, Name, Symbol, Country) VALUES 
(1, 'United States Dollar', '$', 'United States'),
(2, 'Euro', '€', 'Eurozone'),
(3, 'British Pound Sterling', '£', 'United Kingdom'),
(4, 'Yen', '¥', 'Japan'),
(5, 'Swiss Franc', 'CHF', 'Switzerland'),
(6, 'Canadian Dollar', 'C$', 'Canada'),
(7, 'Australian Dollar', 'A$', 'Australia'),
(8, 'Yuan', '¥', 'China'),
(9, 'Rupee', '₹', 'India'),
(10, 'Rand', 'R', 'South Africa'),
(11, 'Guarani', '₲', 'Paraguay'),
(12, 'Argentine Peso', '$', 'Argentina'),
(13, 'Boliviano', 'Bs.', 'Bolivia'),
(14, 'Real', 'R$', 'Brazil'),
(15, 'Chilean Peso', '$', 'Chile'),
(16, 'Colombian Peso', '$', 'Colombia'),
(17, 'Peruvian Nuevo Sol', 'S/.', 'Peru'),
(18, 'Guyanese Dollar', '$', 'Guyana'),
(19, 'Surinamese Dollar', '$', 'Suriname'),
(20, 'Uruguayan Peso', '$', 'Uruguay');

INSERT INTO Periods (Id, Name, Symbol, Quantity, userId?) VALUES 
(1, 'Day', 365),
(2, 'Week', 52),
(3, 'Month', 12),
(4, 'Custom', -1);

INSERT INTO types (Id, Description) VALUES 
(1, 'Progresive', 'Amounts increase by adding a constant value'),
(2, 'Fixed amount', 'Fixed amount for the duration of the loan'),
(3, 'Total', 'Total amount of the loan');