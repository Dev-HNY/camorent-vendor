/**
 * Booking Timeline Component
 * Shows the progress of a booking through different stages
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface TimelineStep {
  label: string;
  status: 'completed' | 'active' | 'upcoming';
  timestamp?: string;
}

interface BookingTimelineProps {
  currentStatus: string;
  rentalStartDate: string | Date;
  rentalEndDate: string | Date;
  createdAt?: string | Date;
  themeColors?: {
    primary: string;
    success: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  translations?: {
    requestSubmitted: string;
    pickupDue: string;
    pickupConfirmed: string;
    returnDue: string;
    completed: string;
    rejectedByOwner: string;
    rejectedByCamorent: string;
  };
}

const CheckIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Line
      x1="8"
      y1="12"
      x2="11"
      y2="15"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="11"
      y1="15"
      x2="16"
      y2="9"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default function BookingTimeline({
  currentStatus,
  rentalStartDate,
  rentalEndDate,
  createdAt,
  themeColors = {
    primary: '#8B5CF6',
    success: '#22C55E',
    text: {
      primary: '#000000',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    },
  },
  translations = {
    requestSubmitted: 'Request Submitted',
    pickupDue: 'Pickup Due',
    pickupConfirmed: 'Pickup Confirmed',
    returnDue: 'Return Due',
    completed: 'Completed',
    rejectedByOwner: 'Rejected by Owner',
    rejectedByCamorent: 'Rejected by Camorent',
  },
}: BookingTimelineProps) {
  const formatDateTime = (date: string | Date | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year} 8:00 AM`;
  };

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate pickup due date (rental start date at 8:00 AM)
  const pickupDueDate = formatDateTime(rentalStartDate);

  // Calculate return due date (rental end date + 1 day at 8:00 AM)
  const returnDueDate = (() => {
    const endDate = typeof rentalEndDate === 'string' ? new Date(rentalEndDate) : rentalEndDate;
    if (isNaN(endDate.getTime())) return '';

    const returnDate = new Date(endDate);
    returnDate.setDate(returnDate.getDate());
    return formatDateTime(returnDate);
  })();

  // Define timeline steps based on status
  // Timeline progression:
  // pending_request: Request Submitted (active)
  // pickup_due: Request Submitted ✓, Pickup Due (active)
  // return_due: Request Submitted ✓, Pickup Due ✓, Pickup Confirmed ✓, Return Due (active), Completed
  // completed: Request Submitted ✓, Pickup Due ✓, Pickup Confirmed ✓, Return Due ✓, Completed ✓
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        label: translations.requestSubmitted,
        status:
          currentStatus === 'vendor_rejection' || currentStatus === 'camorent_rejection'
            ? 'completed'
            : currentStatus === 'pending_request'
            ? 'active'
            : 'completed', // Always completed after pending_request
        timestamp: createdAt ? formatDate(createdAt) : undefined,
      },
      {
        label: translations.pickupDue,
        status:
          currentStatus === 'vendor_rejection' || currentStatus === 'camorent_rejection'
            ? 'upcoming'
            : currentStatus === 'pending_request'
            ? 'upcoming'
            : currentStatus === 'pickup_due'
            ? 'active'
            : 'completed', // Completed for return_due and completed
        timestamp: pickupDueDate,
      },
      {
        label: translations.pickupConfirmed,
        status:
          currentStatus === 'vendor_rejection' || currentStatus === 'camorent_rejection'
            ? 'upcoming'
            : currentStatus === 'pending_request' || currentStatus === 'pickup_due'
            ? 'upcoming'
            : 'completed', // Completed for return_due and completed
      },
      {
        label: translations.returnDue,
        status:
          currentStatus === 'vendor_rejection' || currentStatus === 'camorent_rejection'
            ? 'upcoming'
            : currentStatus === 'return_due'
            ? 'active'
            : currentStatus === 'completed'
            ? 'completed'
            : 'upcoming',
        timestamp: returnDueDate,
      },
      {
        label: translations.completed,
        status:
          currentStatus === 'vendor_rejection' || currentStatus === 'camorent_rejection'
            ? 'upcoming'
            : currentStatus === 'completed'
            ? 'completed'
            : 'upcoming',
      },
    ];

    // If rejected, show rejection status
    if (currentStatus === 'vendor_rejection' || currentStatus === 'camorent_rejection') {
      steps.push({
        label: currentStatus === 'vendor_rejection' ? translations.rejectedByOwner : translations.rejectedByCamorent,
        status: 'completed',
        timestamp: createdAt ? formatDate(createdAt) : undefined,
      });
    }

    return steps;
  };

  const timelineSteps = getTimelineSteps();

  const getStepColor = (status: TimelineStep['status']) => {
    if (status === 'completed') return themeColors.success;
    if (status === 'active') return themeColors.primary;
    return themeColors.text.tertiary;
  };

  return (
    <View style={styles.container}>
      {timelineSteps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          {/* Timeline indicator */}
          <View style={styles.indicatorContainer}>
            {/* Dot or Check */}
            <View style={styles.iconContainer}>
              {step.status === 'completed' ? (
                <CheckIcon color={getStepColor(step.status)} size={24} />
              ) : (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: getStepColor(step.status),
                      borderColor: getStepColor(step.status),
                    },
                    step.status === 'active' && styles.activeDot,
                  ]}
                />
              )}
            </View>

            {/* Connecting line */}
            {index < timelineSteps.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor:
                      step.status === 'completed'
                        ? themeColors.success
                        : themeColors.text.tertiary,
                  },
                ]}
              />
            )}
          </View>

          {/* Step content */}
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.stepLabel,
                {
                  color:
                    step.status === 'completed' || step.status === 'active'
                      ? themeColors.text.primary
                      : themeColors.text.tertiary,
                  fontWeight: step.status === 'active' ? '600' : '400',
                },
              ]}
            >
              {step.label}
            </Text>
            {step.timestamp && (
              <Text style={[styles.timestamp, { color: themeColors.text.secondary }]}>
                {step.timestamp}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 60,
  },
  indicatorContainer: {
    alignItems: 'center',
    width: 40,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
  activeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  stepLabel: {
    fontSize: 15,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    marginTop: 2,
  },
});
