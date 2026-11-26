import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createSeedPosts } from '../data/seedData'
import { parseServings } from '../utils/helpers'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const STORAGE_KEY = 'nourishbridge.data.v2'
const LEGACY_STORAGE_KEY = 'nourishbridge.demo.v1'
const FoodContext = createContext(null)

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const normalizePost = (post = {}) => ({
  id: post.id || makeId(),
  donorName: post.donorName || 'Community donor',
  donorType: post.donorType || 'Household',
  title: post.title || 'Surplus food donation',
  description: post.description || '',
  quantity: post.quantity || 'Serves 10',
  foodCategory: post.foodCategory || 'Cooked Meals',
  location: post.location || 'Nearby',
  expiresIn: post.expiresIn || 'Pickup soon',
  imageUrl: post.imageUrl || '',
  status: ['pending', 'available', 'claim-pending', 'claimed', 'delivered', 'rejected'].includes(post.status)
    ? post.status
    : 'available',
  claimedBy: post.claimedBy || null,
  donorEmail: post.donorEmail || null,
  donorPhone: post.donorPhone || '',
  claimedEmail: post.claimedEmail || null,
  claimedPhone: post.claimedPhone || '',
  claimedSubRole:
    post.claimedSubRole === 'distributor' || post.claimedSubRole === 'self'
      ? post.claimedSubRole
      : null,
  beneficiaryNote: post.beneficiaryNote || '',
  createdAt: post.createdAt || new Date().toISOString(),
})

function loadInitialState() {
  if (typeof window === 'undefined') {
    return { currentUser: null, accounts: [], posts: createSeedPosts() }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.posts)) {
        return {
          accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
          currentUser: parsed.currentUser?.role === 'admin' && parsed.currentUser?.email === ADMIN_EMAIL ? parsed.currentUser : Array.isArray(parsed.accounts) && parsed.accounts.some((account) => account.profile?.email === parsed.currentUser?.email) ? parsed.currentUser : null,
          posts: parsed.posts.filter((post) => !String(post.id).startsWith('seed-')).map(normalizePost),
        }
      }
    }
  } catch (error) {
    console.warn('NourishBridge: could not read saved data.', error)
  }

  return { currentUser: null, accounts: [], posts: createSeedPosts() }
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256)
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const fromRemotePost = (post) => ({
  id: post.id, donorId: post.donor_id, donorName: post.donor_name, donorType: post.donor_type,
  donorEmail: null, donorPhone: '', title: post.title, description: post.description,
  quantity: post.quantity, foodCategory: post.food_category, location: post.location,
  expiresIn: post.expires_in, imageUrl: post.image_url, status: post.status,
  claimedById: post.claimed_by, claimedBy: post.claimed_name, claimedSubRole: post.claimed_sub_role,
  beneficiaryNote: post.beneficiary_note || '', claimedEmail: null, claimedPhone: '',
  whatsappName: post.whatsappName || '', whatsappPhone: post.whatsappPhone || '', createdAt: post.created_at,
})

const fromRemoteProfile = (profile) => ({
  id: profile.id, email: profile.email, name: profile.name, role: profile.role,
  subRole: profile.sub_role, organizationOrArea: profile.organization_or_area,
  phone: profile.phone, revokedAt: profile.revoked_at, createdAt: profile.created_at,
})

export function FoodProvider({ children }) {
  const [demo, setDemo] = useState(loadInitialState)
  const [backendError, setBackendError] = useState('')

  const { currentUser, posts, accounts = [] } = demo

  const refreshRemote = useCallback(async (authUser = undefined) => {
    if (!supabase) return
    try {
      let user = authUser
      if (user === undefined) {
        const { data, error } = await supabase.auth.getUser()
        if (error && error.name !== 'AuthSessionMissingError') throw error
        user = data?.user || null
      }

      let profile = null
      if (user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        if (error) throw error
        profile = data ? fromRemoteProfile(data) : null
        if (!profile || profile.revokedAt) {
          await supabase.auth.signOut()
          user = null
          profile = null
        }
      }
      let userRows = []
      let remoteActivity = []
      if (profile?.role === 'admin') {
        const [{ data: users, error: usersError }, { data: activity, error: activityError }] = await Promise.all([
          supabase.rpc('admin_list_users'), supabase.rpc('admin_get_activity'),
        ])
        if (usersError) throw usersError
        if (activityError) throw activityError
        userRows = users || []
        remoteActivity = activity || []
      }
      const { data: rows, error: postsError } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
      if (postsError) throw postsError
      const profilesById = new Map(userRows.map((item) => [item.id, item]))
      const remotePosts = await Promise.all((rows || []).map(async (row) => {
        let target = null
        if (user && row.status === 'delivered' && [row.donor_id, row.claimed_by].includes(user.id)) {
          const { data } = await supabase.rpc('get_post_whatsapp_contact', { p_post_id: row.id })
          target = Array.isArray(data) ? data[0] : data
        }
        const donor = profilesById.get(row.donor_id)
        const claimant = profilesById.get(row.claimed_by)
        return fromRemotePost({
          ...row, whatsappName: target?.contact_name, whatsappPhone: target?.contact_phone,
          donorEmail: donor?.email, donorPhone: donor?.phone,
          claimedEmail: claimant?.email, claimedPhone: claimant?.phone,
        })
      }))

      const nextAccounts = userRows.map((item) => ({ id: item.id, profile: fromRemoteProfile(item), createdAt: item.created_at, revokedAt: item.revoked_at }))
      const auditLog = remoteActivity.map((item) => ({ id: item.id, action: item.action, title: item.details, actor: item.actor || 'Administrator', createdAt: item.created_at }))

      setDemo((previous) => ({ ...previous, currentUser: profile, posts: remotePosts, accounts: nextAccounts, auditLog }))
      setBackendError('')
    } catch (error) {
      console.error('NourishBridge backend error:', error)
      setBackendError(error.message || 'Could not connect to the shared service.')
    }
  }, [])

  useEffect(() => {
    if (isSupabaseConfigured) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    } catch (error) {
      console.warn('NourishBridge: could not save data.', error)
    }
  }, [demo])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    setDemo({ currentUser: null, accounts: [], posts: [], auditLog: [] })
    supabase.auth.getSession().then(({ data }) => refreshRemote(data.session?.user || null))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => refreshRemote(session?.user || null), 0)
    })
    const channel = supabase.channel('public-app-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => refreshRemote())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => refreshRemote())
      .subscribe()
    return () => { subscription.subscription.unsubscribe(); supabase.removeChannel(channel) }
  }, [refreshRemote])

  const registerOrLogin = useCallback(async (userData = {}, mode = 'register') => {
    const email = String(userData.email || '').trim().toLowerCase()
    if (isSupabaseConfigured) {
      try {
        if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: userData.password })
          if (error) return { error: error.message }
          const { data: account, error: accountError } = await supabase.from('profiles').select('role,revoked_at').eq('id', data.user.id).maybeSingle()
          if (accountError || !account) {
            await supabase.auth.signOut()
            return { error: accountError?.message || 'Account profile is missing. Contact the administrator.' }
          }
          if (account.revoked_at) {
            await supabase.auth.signOut()
            return { error: 'This account has been suspended. Contact the administrator.' }
          }
          if (String(userData.phone || '').trim()) {
            const { error: phoneError } = await supabase.rpc('update_my_phone', { p_phone: String(userData.phone).trim() })
            if (phoneError) return { error: phoneError.message }
          }
          await refreshRemote(data.user)
          return { user: data.user }
        }
        const role = userData.role === 'donor' ? 'donor' : 'receiver'
        const { data, error } = await supabase.auth.signUp({
          email,
          password: userData.password,
          options: { data: {
            name: String(userData.name || '').trim(), role,
            sub_role: role === 'receiver' ? userData.subRole : null,
            organization_or_area: String(userData.organizationOrArea || '').trim(),
            phone: String(userData.phone || '').trim(),
          } },
        })
        if (error) return { error: error.message }
        if (!data.session) return { message: 'Account created. Check your email to confirm it, then sign in.' }
        await refreshRemote(data.user)
        return { user: data.user }
      } catch (error) {
        return { error: error.message || 'Could not connect to the account service.' }
      }
    }
    if (email === 'superadmin@admin.in') return { error: 'Administrator sign-in is available after the shared backend is configured.' }
    const role = userData.role === 'receiver' ? 'receiver' : 'donor'
    const subRole = role === 'receiver' && userData.subRole === 'distributor' ? 'distributor' : role === 'receiver' ? 'self' : null
    const accountId = `${email}|${role}|${subRole || 'donor'}`
    const matchingAccounts = accounts.filter((account) => account.profile?.email === email)
    const exactAccount = accounts.find((account) => account.id === accountId)
    const existing = exactAccount || (matchingAccounts.length === 1 ? matchingAccounts[0] : null)
    if (mode === 'login') {
      if (!existing) return { error: 'No account found for these details. Create an account first.' }
      if (existing.revokedAt) return { error: 'This account has been suspended. Contact the administrator.' }
      const candidate = await hashPassword(userData.password || '', existing.salt)
      if (candidate !== existing.passwordHash) return { error: 'Email or password is incorrect.' }
      const nextUser = { ...existing.profile, email, phone: String(userData.phone || existing.profile.phone || '').trim() }
      setDemo((prev) => ({ ...prev, currentUser: nextUser, accounts: prev.accounts.map((account) => account.id === existing.id ? { ...account, profile: nextUser } : account) }))
      return { user: nextUser }
    }
    if (existing) return { error: 'An account already exists for this email and role. Sign in instead.' }
    const salt = makeId()
    const passwordHash = await hashPassword(userData.password || '', salt)
    const nextUser = {
      name: String(userData.name || '').trim() || 'Guest',
      role,
      subRole,
      organizationOrArea: String(userData.organizationOrArea || '').trim(),
      phone: String(userData.phone || '').trim(),
      email,
    }

    setDemo((prev) => ({ ...prev, currentUser: nextUser, accounts: [...(prev.accounts || []), { id: accountId, salt, passwordHash, profile: nextUser, createdAt: new Date().toISOString() }] }))
    return { user: nextUser }
  }, [accounts, refreshRemote])

  const logoutUser = useCallback(() => {
    if (supabase) {
      supabase.auth.signOut().then(() => refreshRemote(null))
      return
    }
    setDemo((prev) => ({ ...prev, currentUser: null }))
  }, [refreshRemote])

  const addPost = useCallback(async (postData = {}) => {
    if (supabase) {
      const { data, error } = await supabase.from('posts').insert({
        donor_id: currentUser.id, donor_name: currentUser.name, donor_type: postData.donorType,
        title: postData.title, description: postData.description, quantity: postData.quantity,
        food_category: postData.foodCategory, location: postData.location,
        expires_in: postData.expiresIn, image_url: postData.imageUrl, status: 'pending',
      }).select().single()
      if (error) throw error
      await refreshRemote(currentUser)
      return fromRemotePost(data)
    }
    const newPost = normalizePost({
      ...postData,
      id: makeId(),
      claimedBy: null,
      claimedSubRole: null,
      beneficiaryNote: '',
      status: 'pending',
      donorEmail: postData.donorEmail || currentUser?.email || null,
      donorPhone: postData.donorPhone || currentUser?.phone || '',
      createdAt: new Date().toISOString(),
    })

    setDemo((prev) => ({ ...prev, posts: [newPost, ...prev.posts] }))
    return newPost
  }, [currentUser, refreshRemote])

  const claimPost = useCallback(
    async (postId, receiverName, subRole, beneficiaryNote = '') => {
      const target = posts.find((post) => post.id === postId)
      if (!target || target.status !== 'available') return false
      if (supabase) {
        const { data, error } = await supabase.rpc('request_claim', { p_post_id: postId, p_note: beneficiaryNote })
        if (error || !data) return false
        await refreshRemote(currentUser)
        return true
      }
      setDemo((prev) => {
        let changed = false
        const nextPosts = prev.posts.map((post) => {
          if (post.id !== postId || post.status !== 'available') return post

          changed = true
          return {
            ...post,
            status: 'claim-pending',
            claimedBy: String(receiverName || '').trim() || 'Community receiver',
            claimedEmail: currentUser?.email || null,
            claimedPhone: currentUser?.phone || '',
            claimedSubRole: subRole === 'distributor' ? 'distributor' : 'self',
            beneficiaryNote: String(beneficiaryNote || '').trim(),
          }
        })

        return changed ? { ...prev, posts: nextPosts } : prev
      })
      return true
    },
    [posts, currentUser, refreshRemote],
  )

  const markDelivered = useCallback(async (postId, userName) => {
    const target = posts.find((post) => post.id === postId)
    if (
      !target ||
      target.status !== 'claimed' ||
      (target.claimedBy !== userName && target.donorName !== userName)
    ) return false
    if (supabase) {
      const { error } = await supabase.rpc('mark_post_delivered', { p_post_id: postId })
      if (error) return false
      await refreshRemote(currentUser)
      return true
    }
    setDemo((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId && post.status === 'claimed'
          ? { ...post, status: 'delivered' }
          : post,
      ),
    }))
    return true
  }, [posts, currentUser, refreshRemote])

  const reviewPost = useCallback(async (postId, decision) => {
    if (supabase) {
      const { error } = await supabase.rpc('review_donation', { p_post_id: postId, p_decision: decision })
      if (error) { setBackendError(error.message); return }
      await refreshRemote(currentUser)
      return
    }
    setDemo((prev) => ({ ...prev, posts: prev.posts.map((post) => post.id === postId && post.status === 'pending' ? { ...post, status: decision === 'approve' ? 'available' : 'rejected' } : post) }))
  }, [currentUser, refreshRemote])

  const reviewClaim = useCallback(async (postId, decision) => {
    if (supabase) {
      const { error } = await supabase.rpc('review_claim', { p_post_id: postId, p_decision: decision })
      if (error) { setBackendError(error.message); return }
      await refreshRemote(currentUser)
      return
    }
    setDemo((prev) => ({ ...prev, posts: prev.posts.map((post) => post.id === postId && post.status === 'claim-pending' ? { ...post, status: decision === 'approve' ? 'delivered' : 'available', ...(decision === 'reject' ? { claimedBy: null, claimedEmail: null, claimedPhone: '', claimedSubRole: null, beneficiaryNote: '' } : {}) } : post) }))
  }, [currentUser, refreshRemote])

  const removePost = useCallback(async (postId) => {
    if (supabase) {
      const { error } = await supabase.rpc('remove_post', { p_post_id: postId })
      if (error) { setBackendError(error.message); return }
      await refreshRemote(currentUser)
      return
    }
    setDemo((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post.id !== postId),
      auditLog: [
        ...(prev.auditLog || []),
        { id: makeId(), type: 'removed-listing', postId, title: prev.posts.find((post) => post.id === postId)?.title || 'Listing', actor: prev.currentUser?.email || 'Administrator', createdAt: new Date().toISOString() },
      ],
    }))
  }, [currentUser, refreshRemote])

  const setAccountRevoked = useCallback(async (accountId, revoked) => {
    if (supabase) {
      const { error } = await supabase.rpc('set_user_revoked', { p_user_id: accountId, p_revoke: revoked })
      if (error) { setBackendError(error.message); return }
      await refreshRemote(currentUser)
      return
    }
    setDemo((prev) => {
      const target = prev.accounts.find((account) => account.id === accountId)
      if (!target) return prev
      const accounts = prev.accounts.map((account) => account.id === accountId
        ? { ...account, revokedAt: revoked ? new Date().toISOString() : null }
        : account)
      const shouldSignOut = revoked && prev.currentUser?.email === target.profile.email
      return { ...prev, accounts, currentUser: shouldSignOut ? null : prev.currentUser }
    })
  }, [currentUser, refreshRemote])

  const stats = useMemo(() => {
    const availablePosts = posts.filter((post) => post.status === 'available')
    const claimedPosts = posts.filter((post) => post.status === 'claimed')
    const deliveredPosts = posts.filter((post) => post.status === 'delivered')

    const distributorNames = new Set(
      [...claimedPosts, ...deliveredPosts]
        .filter(
          (post) =>
            post.claimedSubRole === 'distributor' && Boolean(post.claimedBy),
        )
        .map((post) => post.claimedBy.trim().toLowerCase()),
    )

    const donorNames = new Set(
      posts
        .map((post) => post.donorName?.trim().toLowerCase())
        .filter(Boolean),
    )

    return {
      mealsRescued: deliveredPosts.reduce(
        (total, post) => total + parseServings(post.quantity),
        0,
      ),
      mealsInMotion: claimedPosts.reduce(
        (total, post) => total + parseServings(post.quantity),
        0,
      ),
      activeDonations: availablePosts.length,
      availableMeals: availablePosts.reduce(
        (total, post) => total + parseServings(post.quantity),
        0,
      ),
      communityDistributors: distributorNames.size,
      donors: donorNames.size,
      totalDonations: posts.length,
    }
  }, [posts])

  const value = useMemo(
    () => ({
      currentUser,
      hasAccounts: isSupabaseConfigured || accounts.length > 0,
      backendConfigured: isSupabaseConfigured,
      backendError,
      accounts,
      posts,
      stats,
      registerOrLogin,
      logoutUser,
      addPost,
      claimPost,
      markDelivered,
      refreshRemote,
      reviewPost,
      reviewClaim,
      removePost,
      setAccountRevoked,
      auditLog: demo.auditLog || [],
    }),
    [
      currentUser,
      accounts,
      backendError,
      posts,
      stats,
      registerOrLogin,
      logoutUser,
      addPost,
      claimPost,
      markDelivered,
      refreshRemote,
      reviewPost,
      reviewClaim,
      removePost,
      setAccountRevoked,
      demo.auditLog,
    ],
  )

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>
}

export function useFood() {
  const context = useContext(FoodContext)
  if (!context) {
    throw new Error('useFood must be used inside a <FoodProvider>.')
  }
  return context
}

export { STORAGE_KEY }
