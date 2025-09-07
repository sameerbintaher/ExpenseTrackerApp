import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });

  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryColor = (category) => {
    const categoryColorMap = {
      Food: colors.categoryFood,
      Transport: colors.categoryTransport,
      Shopping: colors.categoryShopping,
      Others: colors.categoryOthers,
    };
    return categoryColorMap[category] || colors.textTertiary;
  };

  // Prepare data for pie chart
  const pieChartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    population: amount,
    color: getCategoryColor(category),
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  const renderCategoryCard = (category, amount) => {
    const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
    
    return (
      <View key={category} style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[
          styles.categoryIndicator, 
          { backgroundColor: getCategoryColor(category) }
        ]} />
        <View style={styles.categoryInfo}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
            <Text style={[styles.categoryPercentage, { color: colors.textSecondary }]}>{percentage}%</Text>
          </View>
          <Text style={[styles.categoryAmount, { color: colors.text }]}>${amount.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.surface }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your spending habits</Text>
          </View>
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={toggleTheme}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>${totalAmount.toFixed(2)}</Text>
          <Text style={[styles.summarySubtext, { color: colors.textTertiary }]}>{expenses.length} transactions</Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>This Month</Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>${thisMonthTotal.toFixed(2)}</Text>
          <Text style={[styles.summarySubtext, { color: colors.textTertiary }]}>{thisMonthExpenses.length} transactions</Text>
        </View>
      </View>

      {/* Pie Chart Section */}
      {pieChartData.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Distribution</Text>
          <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <PieChart
              data={pieChartData}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                color: (opacity = 1) => colors.text,
                labelColor: (opacity = 1) => colors.text,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 50]}
              absolute
            />
          </View>
        </View>
      )}

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
        {Object.keys(categoryTotals).length > 0 ? (
          <View style={styles.categoriesContainer}>
            {Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => renderCategoryCard(category, amount))
            }
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expenses yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Start adding expenses to see your spending breakdown
            </Text>
          </View>
        )}
      </View>

      {/* Recent Expenses */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
        {expenses.slice(0, 3).map(expense => (
          <View key={expense.id} style={[styles.recentExpenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.recentExpenseInfo}>
              <Text style={[styles.recentExpenseAmount, { color: colors.text }]}>${expense.amount.toFixed(2)}</Text>
              <Text style={[styles.recentExpenseCategory, { color: colors.textSecondary }]}>{expense.category}</Text>
            </View>
            <Text style={[styles.recentExpenseDate, { color: colors.textSecondary }]}>
              {new Date(expense.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentExpenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentExpenseInfo: {
    flex: 1,
  },
  recentExpenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentExpenseCategory: {
    fontSize: 14,
    marginTop: 2,
  },
  recentExpenseDate: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
