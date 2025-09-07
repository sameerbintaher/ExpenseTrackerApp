import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  StyleSheet,
  RefreshControl 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_COLORS = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Others: '#6b7280',
};

const DUMMY_DATA = [
  {
    id: '1',
    amount: 25.50,
    category: 'Food',
    date: '2024-01-15',
    notes: 'Lunch at downtown cafe',
    createdAt: '2024-01-15T12:30:00.000Z',
  },
  {
    id: '2',
    amount: 45.00,
    category: 'Transport',
    date: '2024-01-14',
    notes: 'Gas for the week',
    createdAt: '2024-01-14T08:15:00.000Z',
  },
  {
    id: '3',
    amount: 120.99,
    category: 'Shopping',
    date: '2024-01-13',
    notes: 'New winter jacket',
    createdAt: '2024-01-13T16:45:00.000Z',
  },
  {
    id: '4',
    amount: 15.75,
    category: 'Others',
    date: '2024-01-12',
    notes: 'Monthly subscription',
    createdAt: '2024-01-12T10:20:00.000Z',
  },
];

export default function ExpenseListScreen() {
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        // Load dummy data if no expenses exist
        setExpenses(DUMMY_DATA);
        await AsyncStorage.setItem('expenses', JSON.stringify(DUMMY_DATA));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses(DUMMY_DATA);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    const categoryColorMap = {
      Food: colors.categoryFood,
      Transport: colors.categoryTransport,
      Shopping: colors.categoryShopping,
      Others: colors.categoryOthers,
    };
    return categoryColorMap[category] || colors.textTertiary;
  };

  const renderExpenseItem = (expense) => (
    <View key={expense.id} style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.expenseHeader}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: colors.text }]}>${expense.amount.toFixed(2)}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(expense.date)}</Text>
        </View>
        <View style={[
          styles.categoryBadge, 
          { backgroundColor: getCategoryColor(expense.category) }
        ]}>
          <Text style={styles.categoryText}>{expense.category}</Text>
        </View>
      </View>
      {expense.notes ? (
        <Text style={[styles.notes, { color: colors.textSecondary }]}>{expense.notes}</Text>
      ) : null}
    </View>
  );

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Your Expenses</Text>
        <View style={[styles.totalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Spent</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>${totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.expensesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {expenses.length > 0 ? (
          expenses.map(renderExpenseItem)
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expenses yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Add your first expense to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  expensesList: {
    flex: 1,
    padding: 16,
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
