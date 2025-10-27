/**
 * 格式化数字，添加千位分隔符
 * @param value - 数字或字符串
 * @param decimals - 保留小数位数（默认2位）
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value

  if (isNaN(num)) return "0"

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化货币金额
 * @param value - 数字或字符串
 * @param currency - 货币符号（默认 'US$'）
 * @param decimals - 保留小数位数（默认0位）
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(value: number | string, currency = "US$", decimals = 0): string {
  const formatted = formatNumber(value, decimals)
  return `${currency}${formatted}`
}

/**
 * 从货币字符串中提取数字并重新格式化
 * @param currencyString - 货币字符串（如 "US$7198730173.36"）
 * @returns 格式化后的货币字符串（如 "US$7,198,730,173"）
 */
export function reformatCurrency(currencyString: string): string {
  // 提取货币符号和数字
  const match = currencyString.match(/^([A-Z$]+)([\d.]+)$/)
  if (!match) return currencyString

  const [, currency, value] = match
  return formatCurrency(value, currency, 0)
}

/**
 * 格式化大数字为简化形式（如 1.5b, 2.3m）
 * @param value - 数字
 * @returns 格式化后的字符串
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}b`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}m`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toFixed(0)
}
