# Geometric Series

A geometric series is an infinite series characterized by two values:
- \(a\): the first term of the series
- \(\rho\): the common ratio of the series

Mathematically, it is written as

\[
\sum_{n=1}^{\infty} a\rho^{n-1}
\]

## Sum of an Infinite Geometric Series

The sum of a geometric series can be found by evaluating its partial sum.

Let

\[
S_n = a + a\rho + a\rho^2 + \cdots + a\rho^{n-1}
\]

Multiply both sides by \(\rho\):

\[
\rho S_n = a\rho + a\rho^2 + \cdots + a\rho^n
\]

Now subtract the second equation from the first:

\[
S_n - \rho S_n = a - a\rho^n
\]

\[
S_n(1-\rho) = a(1-\rho^n)
\]

So, for \(\rho \neq 1\),

\[
S_n = \frac{a(1-\rho^n)}{1-\rho}
\]

For the infinite sum, take the limit as \(n \to \infty\):

\[
S = \lim_{n\to\infty} S_n
\]

If \(|\rho| < 1\), then \(\rho^n \to 0\), so

\[
S = \frac{a}{1-\rho}
\]

### Visual Intuition

Think of the total sum \(S\) as one whole length:

```text
S = |------ a ------|--------- ρS ---------|
```

The first part is \(a\), and the remaining part is \(\rho S\). Therefore,

\[
S = a + \rho S
\]

\[
S(1-\rho) = a
\]

\[
S = \frac{a}{1-\rho}
\]

This is the same formula, but seen visually.

## Condition for Convergence

The series converges when

\[
|\rho| < 1
\]

because \(\rho^n \to 0\) as \(n \to \infty\). In that case,

\[
S = \frac{a}{1-\rho}
\]

If \(|\rho| \ge 1\), the series does not converge to a finite sum.
- If \(\rho > 1\), it grows without bound.
- If \(\rho = 1\), the terms do not go to zero, so it diverges.
- If \(\rho = -1\), it oscillates and does not settle to a finite value.
- If \(\rho < -1\), it oscillates with growing magnitude.

## The Ratio Test

The ratio test tells us whether a series converges or diverges by looking at the ratio of two consecutive terms.

Let

\[
L = \lim_{n\to\infty} \left|\frac{a_{n+1}}{a_n}\right|
\]

Then:
- If \(L < 1\), the series converges.
- If \(L > 1\), the series diverges.
- If \(L = 1\), the test is inconclusive.

For a geometric series, \(a_n = a\rho^{n-1}\), so

\[
L = |\rho|
\]

Therefore, a geometric series converges when \(|\rho| < 1\) and diverges when \(|\rho| > 1\). When \(|\rho| = 1\), the ratio test is inconclusive, so we check directly.

## Economics Connection to the Series

The geometric series is a baseline tool used for computing present value. In economics, we consider the time value of money: money today is worth more than the same amount of money received in the future. To find the value today, future money is scaled down by a factor

\[
\frac{1}{1+r}
\]

where \(r > 0\) is the interest rate.

### Present Value of a Perpetuity

An infinite revenue stream paying a constant amount \(V\) at the end of each period forms a geometric series:

\[
PV = \frac{V}{1+r} + \frac{V}{(1+r)^2} + \frac{V}{(1+r)^3} + \cdots
\]

\[
PV = \sum_{t=1}^{\infty} \frac{V}{1+r}\left(\frac{1}{1+r}\right)^{t-1}
\]

Here, the first term is

\[
a = \frac{V}{1+r}
\]

and the common ratio is

\[
\rho = \frac{1}{1+r} < 1
\]

Using

\[
S = \frac{a}{1-\rho}
\]

we get

\[
PV = \frac{\frac{V}{1+r}}{1-\frac{1}{1+r}}
\]

\[
PV = \frac{V}{r}
\]

This is the standard perpetuity formula.

### Keynesian Expenditure Multiplier

When an initial government expenditure or investment stimulus \(I\) enters an economy, it creates income for workers and firms. The recipients save a portion and spend the rest. The fraction they spend is called the marginal propensity to consume, \(c\), where \(0 < c < 1\).

This re-spending creates a continuous, diminishing cycle of expenditure rounds.

The total economic output \(\Delta Y\) generated across all future rounds is

\[
\Delta Y = I + cI + c^2I + c^3I + \cdots
\]

\[
\Delta Y = \sum_{t=1}^{\infty} I c^{t-1}
\]

Because \(|c| < 1\), the series converges to

\[
\Delta Y = \frac{I}{1-c}
\]

This is the Keynesian spending multiplier.

## Economics Practice Problems with Solutions

### 1. Commercial Project

A commercial project generates a net annual revenue stream of \(\$500{,}000\) per year forever, starting at \(t = 1\). The discount rate is \(r = 0.08\).

**Write the present value:**

\[
PV = \frac{500{,}000}{1.08} + \frac{500{,}000}{(1.08)^2} + \frac{500{,}000}{(1.08)^3} + \cdots
\]

**Calculate the PV:**

Using the perpetuity formula:

\[
PV = \frac{V}{r}
\]

\[
PV = \frac{500{,}000}{0.08} = 6{,}250{,}000
\]

**Is the project profitable?**

Initial cost at \(t=0\) is \(\$10{,}000{,}000\).

\[
NPV = PV - \text{Initial Cost}
\]

\[
NPV = 6{,}250{,}000 - 10{,}000{,}000 = -3{,}750{,}000
\]

Since \(NPV < 0\), the project is not profitable.

---

### 2. Keynesian Multiplier

An initial stimulus of \(\$20\) billion enters the economy. In each subsequent round, recipients spend \(70\%\) of the received amount, so \(c = 0.7\).

The total economic impact is

\[
\Delta Y = \frac{I}{1-c}
\]

\[
\Delta Y = \frac{20}{1-0.7}
\]

\[
\Delta Y = \frac{20}{0.3}
\]

\[
\Delta Y = 66.67 \text{ billion}
\]

So the total economic impact is approximately \(\$66.67\) billion.

---

### 3. Growing Dividend

An asset pays a dividend \(C_1 = C\) at \(t=1\). In each subsequent period, the dividend grows at a constant rate \(g\), so

\[
C_t = C(1+g)^{t-1}
\]

The discount rate is \(r\).

The present value is

\[
PV = \sum_{t=1}^{\infty} \frac{C(1+g)^{t-1}}{(1+r)^t}
\]

Rewrite it as a geometric series:

\[
PV = \frac{C}{1+r} \sum_{t=1}^{\infty} \left(\frac{1+g}{1+r}\right)^{t-1}
\]

This is a geometric series with

\[
a = \frac{C}{1+r}
\]

and

\[
\rho = \frac{1+g}{1+r}
\]

For convergence, we need

\[
|\rho| < 1
\]

Since \(r\) and \(g\) are positive, this usually means

\[
r > g
\]

Using

\[
S = \frac{a}{1-\rho}
\]

we get

\[
PV = \frac{\frac{C}{1+r}}{1 - \frac{1+g}{1+r}}
\]

\[
PV = \frac{C}{r-g}
\]

So the growing perpetuity formula is

\[
PV = \frac{C}{r-g}, \quad r > g
\]

---

## Extra Practice Problems

Try these on your own. Solutions are below.

1. Find the sum:
\[
\sum_{n=1}^{\infty} 8(0.2)^{n-1}
\]

2. Use the ratio test to decide whether the series converges or diverges:
\[
\sum_{n=1}^{\infty} 3(1.1)^{n-1}
\]

3. A perpetuity pays \(\$2{,}000\) per year forever. The interest rate is \(r = 0.04\). Find its present value.

4. An initial stimulus of \(\$30\) billion enters the economy. The marginal propensity to consume is \(c = 0.6\). Find the total economic impact.

5. A stock pays a dividend of \(\$200\) next year. Dividends grow at \(g = 0.04\) forever. The discount rate is \(r = 0.09\). Find the present value.

6. A project generates \(\$150{,}000\) per year forever. The discount rate is \(r = 0.12\). The initial cost is \(\$1{,}100{,}000\). Is the project profitable?

### Solutions

1. \[
S = \frac{8}{1-0.2} = \frac{8}{0.8} = 10
\]

2. Here \(\rho = 1.1\), so \(|\rho| = 1.1 > 1\). The series diverges.

3. \[
PV = \frac{2000}{0.04} = 50{,}000
\]

4. \[
\Delta Y = \frac{30}{1-0.6} = \frac{30}{0.4} = 75
\]
So the total impact is \(\$75\) billion.

5. \[
PV = \frac{C}{r-g} = \frac{200}{0.09-0.04} = \frac{200}{0.05} = 4{,}000
\]

6. \[
PV = \frac{150{,}000}{0.12} = 1{,}250{,}000
\]
\[
NPV = 1{,}250{,}000 - 1{,}100{,}000 = 150{,}000
\]
Since \(NPV > 0\), the project is profitable.