const express = require('express');
const swaggerUi = require('swagger-ui-express');
const isNumber = require('is-number');
const fs = require('fs');

const app = express();
app.use(express.json());

const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

app.post('/compute-investment', (req, res) => {
    const {
        amount,
        years,
        portfolioName
    } = req.body;

    // Validate input
    if (!isNumber(amount) || !isNumber(years) || years > 100 || typeof portfolioName !== 'string') {
        return res.status(400).json({
            error: 'Invalid input'
        });
    }

    // Load portfolio details
    let portfolio;
    try {
        const data = fs.readFileSync(`portfolios/${portfolioName}.json`, 'utf8');
        portfolio = JSON.parse(data);
    } catch (error) {
        return res.status(404).json({
            error: 'Portfolio not found'
        });
    }

    const returns = computeReturns(amount, years, portfolio);

    res.json({
        returns
    });
});

function computeReturns(amount, years, portfolio) {
    let currentAmount = amount;

    for (let year = 0; year < years; year++) {
        const interest = currentAmount * (portfolio.interestRate / 100);
        currentAmount += interest;
        currentAmount -= currentAmount * (portfolio.anualPercentageFee / 100);
        currentAmount -= portfolio.fixedFee;
    }

    return currentAmount;
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
