/**
 * Date Selection Screen - Modern Design
 * Allows users to select start (From) and end (Till) dates for equipment rental
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { useOrderStore } from '../src/store/orderStore';

interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
}

// Modern SVG Icons
const ChevronLeftIcon = ({ color = '#000', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRightIcon = ({ color = '#000', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = ({ color = '#FFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EditIcon = ({ color = '#FFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const XIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function DateSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const orderName = params.orderName as string || 'New Order';
  const setRentalDates = useOrderStore((state) => state.setRentalDates);

  // Get translated months and days
  const MONTHS = [
    t.calendar.january, t.calendar.february, t.calendar.march, t.calendar.april,
    t.calendar.may, t.calendar.june, t.calendar.july, t.calendar.august,
    t.calendar.september, t.calendar.october, t.calendar.november, t.calendar.december
  ];

  const DAYS = [
    t.calendar.sunday, t.calendar.monday, t.calendar.tuesday, t.calendar.wednesday,
    t.calendar.thursday, t.calendar.friday, t.calendar.saturday
  ];

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [tillDate, setTillDate] = useState<Date | null>(null);
  const [selectingFrom, setSelectingFrom] = useState(true);

  const okButtonScale = useSharedValue(1);

  const okButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: okButtonScale.value }],
  }));

  const getDaysInMonth = (month: number, year: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (selectingFrom) {
      setFromDate(date);
      setTillDate(null);
      setSelectingFrom(false);
    } else {
      if (fromDate && date < fromDate) {
        setTillDate(fromDate);
        setFromDate(date);
      } else {
        setTillDate(date);
      }
    }
  };

  const isDateSelected = (date: Date): boolean => {
    if (!fromDate && !tillDate) return false;

    const dateStr = date.toDateString();
    return dateStr === fromDate?.toDateString() || dateStr === tillDate?.toDateString();
  };

  const isDateInRange = (date: Date): boolean => {
    if (!fromDate || !tillDate) return false;
    return date > fromDate && date < tillDate;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const handleClear = () => {
    setFromDate(null);
    setTillDate(null);
    setSelectingFrom(true);
  };

  const formatDateForParam = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    if (fromDate && tillDate) {
      setRentalDates(fromDate.toISOString(), tillDate.toISOString());

      router.push({
        pathname: '/owner-selection',
        params: {
          orderName: orderName || 'New Order',
          startDate: formatDateForParam(fromDate),
          endDate: formatDateForParam(tillDate),
        },
      });
    }
  };

  const handleOkPressIn = () => {
    okButtonScale.value = withSpring(0.96, { damping: 15 });
  };

  const handleOkPressOut = () => {
    okButtonScale.value = withSpring(1, { damping: 15 });
  };

  const calendarDays = getDaysInMonth(currentMonth, currentYear);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <LinearGradient
          colors={[theme.colors.primary, '#4B4F8C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeftIcon color="#FFF" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <CalendarIcon color="#FFF" size={24} />
            <Text style={styles.headerTitle}>{t.calendar.selectDates}</Text>
          </View>
          <View style={styles.headerRight} />
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Selected Date Display */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <LinearGradient
            colors={[theme.colors.primary + 'E6', theme.colors.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.selectedDateContainer}
          >
            <View style={styles.dateCard}>
              <View style={styles.dateLabel}>
                <Text style={styles.dateLabelText}>{t.calendar.from.toUpperCase()}</Text>
              </View>
              <Text style={styles.selectedDateText}>
                {fromDate ? formatDate(fromDate) : t.calendar.selectStartDate}
              </Text>
              {fromDate && (
                <TouchableOpacity style={styles.editButton} onPress={() => setSelectingFrom(true)}>
                  <EditIcon color="#FFF" size={16} />
                </TouchableOpacity>
              )}
            </View>

            {tillDate && (
              <View style={[styles.dateCard, styles.tillDateCard]}>
                <View style={[styles.dateLabel, styles.tillDateLabel]}>
                  <Text style={styles.dateLabelText}>{t.calendar.till.toUpperCase()}</Text>
                </View>
                <Text style={styles.selectedDateText}>{formatDate(tillDate)}</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => setSelectingFrom(false)}>
                  <EditIcon color="#FFF" size={16} />
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.calendarWrapper}>
          <View style={[styles.calendarContainer, { backgroundColor: theme.colors.background.secondary }]}>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                onPress={handlePreviousMonth}
                style={[styles.navButton, { backgroundColor: theme.colors.background.primary }]}
              >
                <ChevronLeftIcon color={theme.colors.text.primary} size={20} />
              </TouchableOpacity>
              <Text style={[styles.monthYear, { color: theme.colors.text.primary }]}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={[styles.navButton, { backgroundColor: theme.colors.background.primary }]}
              >
                <ChevronRightIcon color={theme.colors.text.primary} size={20} />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {DAYS.map((day, index) => (
                <Text key={index} style={[styles.dayHeader, { color: theme.colors.text.secondary }]}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((dayInfo, index) => {
                const isSelected = isDateSelected(dayInfo.date);
                const isInRange = isDateInRange(dayInfo.date);
                const isToday = dayInfo.date.toDateString() === today.toDateString();
                const isPast = dayInfo.date < today && dayInfo.date.toDateString() !== today.toDateString();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      isInRange && { backgroundColor: theme.colors.primary + '15' },
                    ]}
                    onPress={() => dayInfo.isCurrentMonth && !isPast && handleDateSelect(dayInfo.date)}
                    disabled={!dayInfo.isCurrentMonth || isPast}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={[theme.colors.primary, '#4B4F8C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.dayCircle}
                      >
                        <Text style={styles.dayTextSelected}>{dayInfo.day}</Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.dayCircle,
                          isToday && !isSelected && { borderWidth: 2, borderColor: theme.colors.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: theme.colors.text.primary },
                            !dayInfo.isCurrentMonth && { color: theme.colors.text.tertiary, opacity: 0.4 },
                            isPast && { color: theme.colors.text.tertiary, textDecorationLine: 'line-through' },
                          ]}
                        >
                          {dayInfo.day}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View
        entering={FadeInUp.delay(250).duration(400)}
        style={[styles.bottomActions, { backgroundColor: theme.colors.background.secondary, paddingBottom: insets.bottom + 20 }]}
      >
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <XIcon color={theme.colors.text.secondary} size={18} />
          <Text style={[styles.clearButtonText, { color: theme.colors.text.secondary }]}>{t.calendar.clear}</Text>
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>{t.common.cancel}</Text>
          </TouchableOpacity>
          <Animated.View style={okButtonAnimatedStyle}>
            <Pressable
              onPress={handleConfirm}
              onPressIn={handleOkPressIn}
              onPressOut={handleOkPressOut}
              disabled={!fromDate || !tillDate}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            >
              <LinearGradient
                colors={
                  fromDate && tillDate
                    ? [theme.colors.primary, '#4B4F8C']
                    : [theme.colors.text.tertiary, theme.colors.text.tertiary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.okButton}
              >
                <Text style={styles.okButtonText}>{t.calendar.confirm}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = (SCREEN_WIDTH - 40) / 7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  selectedDateContainer: {
    padding: 20,
    paddingBottom: 24,
  },
  dateCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tillDateCard: {
    marginBottom: 0,
  },
  dateLabel: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tillDateLabel: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dateLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  selectedDateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrapper: {
    padding: 16,
  },
  calendarContainer: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayHeader: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dayTextSelected: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  okButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  okButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
