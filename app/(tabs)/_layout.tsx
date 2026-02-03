/**
 * Tab Layout for authenticated vendor screens
 * Fully themed and translated
 */

import { Tabs } from 'expo-router';
import { AnimatedTabBar, HomeIcon, CalendarIcon, BoxIcon, CreditCardIcon } from '../../src/components';
import { useTranslation } from '../../src/context/LanguageContext';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="active-jobs"
        options={{
          title: t.tabs.activeJobs,
          tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="track-order"
        options={{
          title: t.tabs.requests,
          tabBarIcon: ({ color }) => <BoxIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settle-payment"
        options={{
          title: t.tabs.settlePayment,
          tabBarIcon: ({ color }) => <CreditCardIcon color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
