// src/test/App.test.ts
// Basic test to verify that the app components are properly configured

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import MainLayout from '../components/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import VesselsView from '../views/VesselsView.vue'
import AnchoragesView from '../views/AnchoragesView.vue'
import TripsView from '../views/TripsView.vue'

import Card from '../components/Card.vue'
import EnhancedDataTable from '../components/ui/EnhancedDataTable.vue'
import EnhancedChart from '../components/ui/EnhancedChart.vue'

describe('Application Components', () => {
  it('mounts App component successfully', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts MainLayout component successfully', () => {
    const wrapper = mount(MainLayout)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts DashboardView component successfully', () => {
    const wrapper = mount(DashboardView)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts VesselsView component successfully', () => {
    const wrapper = mount(VesselsView)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts AnchoragesView component successfully', () => {
    const wrapper = mount(AnchoragesView)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts TripsView component successfully', () => {
    const wrapper = mount(TripsView)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts Card component successfully', () => {
    const wrapper = mount(Card)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts EnhancedDataTable component successfully', () => {
    const wrapper = mount(EnhancedDataTable)
    expect(wrapper.exists()).toBe(true)
  })

  it('mounts EnhancedChart component successfully', () => {
    const wrapper = mount(EnhancedChart)
    expect(wrapper.exists()).toBe(true)
  })
})

// Test for new UI components
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'

describe('New UI Components', () => {
  it('mounts LoadingSpinner component successfully', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.exists()).toBe(true)
  })
})
