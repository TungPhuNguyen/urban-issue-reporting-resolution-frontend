import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Building2,
  Camera,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  HeartHandshake,
  LocateFixed,
  MapPinned,
  MessageCircleMore,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Vote,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { BlurText, Reveal, SpotlightCard } from '@/components/ui/CivicPulseAnimations'
import { CivicPulseLogo } from '@/components/ui/CivicPulseLogo'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface Feature {
  icon: LucideIcon
  title: string
  text: string
}

const features: Feature[] = [
  {
    icon: LocateFixed,
    title: 'Gửi đúng vị trí',
    text: 'Chọn điểm trên bản đồ, hệ thống tự xác định khu vực và đơn vị phụ trách.',
  },
  {
    icon: Route,
    title: 'Tự động điều phối',
    text: 'Báo cáo được chuyển theo loại sự cố, khu vực và luật phân công đã cấu hình.',
  },
  {
    icon: BellRing,
    title: 'Theo dõi từng bước',
    text: 'Nhận thông báo khi báo cáo được tiếp nhận, xử lý và hoàn tất.',
  },
  {
    icon: ShieldCheck,
    title: 'Minh bạch công khai',
    text: 'Cộng đồng theo dõi trạng thái, tiến độ và hình ảnh minh chứng rõ ràng.',
  },
]

const workflow = [
  {
    number: '01',
    icon: Camera,
    title: 'Ghi nhận sự cố',
    text: 'Chụp ảnh, mô tả tình trạng và định vị chính xác trên bản đồ.',
  },
  {
    number: '02',
    icon: Building2,
    title: 'Điều phối đơn vị',
    text: 'Hệ thống tự động định tuyến đến đúng đơn vị và cán bộ xử lý.',
  },
  {
    number: '03',
    icon: Wrench,
    title: 'Cập nhật tiến độ',
    text: 'Cán bộ thêm ghi chú, hình ảnh và trạng thái theo từng mốc công việc.',
  },
  {
    number: '04',
    icon: FileCheck2,
    title: 'Xác nhận kết quả',
    text: 'Người dân xem minh chứng, đóng báo cáo hoặc gửi khiếu nại khi cần.',
  },
]

const reportRows = [
  {
    code: 'UI-124',
    title: 'Đèn đường không hoạt động',
    area: 'Ba Đình',
    status: 'InProgress',
    votes: 128,
  },
  {
    code: 'UI-118',
    title: 'Ổ gà gần nút giao Kim Mã',
    area: 'Ba Đình',
    status: 'Assigned',
    votes: 93,
  },
  {
    code: 'UI-102',
    title: 'Điểm tập kết rác tự phát',
    area: 'Trúc Bạch',
    status: 'Resolved',
    votes: 51,
  },
]

interface FloatingIssueCardProps {
  className: string
  icon: LucideIcon
  label: string
  value: string
  tone: 'green' | 'amber' | 'violet'
}

function FloatingIssueCard({
  className,
  icon: Icon,
  label,
  value,
  tone,
}: FloatingIssueCardProps) {
  return (
    <div className={`floating-issue ${className}`}>
      <span className={`floating-issue__icon floating-issue__icon--${tone}`}>
        <Icon aria-hidden="true" size={18} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="product-preview" aria-label="Xem trước bảng điều khiển Civic Pulse">
      <div className="product-preview__windowbar" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="product-preview__address">app.civicpulse.vn/dashboard</div>
      </div>
      <div className="product-preview__layout">
        <aside className="preview-sidebar" aria-hidden="true">
          <CivicPulseLogo compact />
          <div className="preview-sidebar__item active">
            <ChartNoAxesCombined size={15} />
          </div>
          <div className="preview-sidebar__item">
            <FileCheck2 size={15} />
          </div>
          <div className="preview-sidebar__item">
            <MapPinned size={15} />
          </div>
          <div className="preview-sidebar__item">
            <UsersRound size={15} />
          </div>
        </aside>
        <div className="preview-main">
          <header className="preview-main__header">
            <div>
              <small>Xin chào,</small>
              <strong>Nguyễn Hoàng Anh 👋</strong>
            </div>
            <span className="avatar">A</span>
          </header>
          <div className="preview-kpis">
            <div>
              <small>Đang xử lý</small>
              <strong>118</strong>
              <span>+12 tuần này</span>
            </div>
            <div>
              <small>Đã hoàn tất</small>
              <strong>672</strong>
              <span>88.4% đúng hạn</span>
            </div>
            <div>
              <small>Cần chú ý</small>
              <strong>17</strong>
              <span>Gần quá hạn SLA</span>
            </div>
          </div>
          <div className="preview-grid">
            <div className="preview-card preview-chart">
              <div className="preview-card__head">
                <strong>Tiến độ xử lý</strong>
                <Badge variant="success">30 ngày</Badge>
              </div>
              <div className="mini-chart" aria-hidden="true">
                {[38, 52, 46, 67, 62, 84, 78, 96, 91, 112, 104, 124].map(
                  (value, index) => (
                    <i key={index} style={{ height: `${value / 1.3}px` }} />
                  ),
                )}
              </div>
              <div className="mini-chart__axis">
                <span>05/07</span>
                <span>15/07</span>
                <span>25/07</span>
                <span>04/08</span>
              </div>
            </div>
            <div className="preview-card preview-donut">
              <div className="preview-card__head">
                <strong>Trạng thái</strong>
              </div>
              <div className="donut">
                <span>
                  <strong>1.248</strong>
                  <small>Báo cáo</small>
                </span>
              </div>
              <div className="donut-legend">
                <span>
                  <i className="green" /> Hoàn tất
                </span>
                <span>
                  <i className="blue" /> Đang xử lý
                </span>
                <span>
                  <i className="gray" /> Khác
                </span>
              </div>
            </div>
          </div>
          <div className="preview-card preview-table">
            <div className="preview-card__head">
              <strong>Báo cáo mới nhất</strong>
              <span>
                Xem tất cả <ChevronRight size={14} />
              </span>
            </div>
            {reportRows.map((row) => (
              <div className="preview-row" key={row.code}>
                <span className="preview-row__code">{row.code}</span>
                <div>
                  <strong>{row.title}</strong>
                  <small>{row.area}</small>
                </div>
                <StatusBadge status={row.status} />
                <span className="preview-row__vote">
                  <Vote size={13} /> {row.votes}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-section__inner container">
          <Reveal className="hero-eyebrow">
            <Badge variant="info">
              <Sparkles aria-hidden="true" size={14} /> Nền tảng đô thị số dành cho cộng
              đồng
            </Badge>
          </Reveal>
          <h1>
            <BlurText text="Nhìn thấy, báo cáo và cùng nhau thay đổi thành phố" />
          </h1>
          <Reveal delay={240}>
            <p className="hero-lead">
              Một điểm chạm để người dân phản ánh sự cố, cơ quan chức năng xử lý đúng hạn
              và mọi tiến độ đều được công khai minh bạch.
            </p>
          </Reveal>
          <Reveal delay={340} className="hero-actions">
            <Link to="/register">
              <Button size="lg">
                <Camera aria-hidden="true" size={18} /> Tạo báo cáo đầu tiên
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="ghost">
                <MapPinned aria-hidden="true" size={18} /> Khám phá quy trình
              </Button>
            </a>
          </Reveal>
          <Reveal delay={440} className="hero-trust">
            <div className="hero-avatars" aria-hidden="true">
              <span>A</span>
              <span>M</span>
              <span>T</span>
              <span>+2k</span>
            </div>
            <div>
              <strong>Được cộng đồng tin dùng</strong>
              <small>Hàng nghìn phản ánh được theo dõi minh bạch mỗi tháng</small>
            </div>
          </Reveal>

          <FloatingIssueCard
            className="floating-issue--one"
            icon={CheckCircle2}
            label="Đã xử lý hôm nay"
            value="86 sự cố"
            tone="green"
          />
          <FloatingIssueCard
            className="floating-issue--two"
            icon={Clock3}
            label="Thời gian phản hồi"
            value="< 2 giờ"
            tone="amber"
          />
          <FloatingIssueCard
            className="floating-issue--three"
            icon={MessageCircleMore}
            label="Cộng đồng"
            value="2.4K lượt tương tác"
            tone="violet"
          />
        </div>
      </section>

      <section className="trusted-strip">
        <div className="trusted-strip__inner container">
          <span>Đồng hành vì một Hà Nội</span>
          <div>
            <BadgeCheck /> Minh bạch hơn
          </div>
          <div>
            <Clock3 /> Phản hồi nhanh hơn
          </div>
          <div>
            <HeartHandshake /> Đáng sống hơn
          </div>
          <div>
            <UsersRound /> Kết nối hơn
          </div>
        </div>
      </section>

      <section className="section section--features" id="how-it-works">
        <div className="container">
          <Reveal className="section-heading section-heading--center">
            <Badge>Năng lực nền tảng</Badge>
            <h2>
              Mọi công cụ cần thiết để biến phản ánh thành <em>hành động thực tế</em>
            </h2>
            <p>
              Đơn giản cho người dân, rõ ràng cho đơn vị xử lý và đủ dữ liệu để quản trị
              đô thị hiệu quả.
            </p>
          </Reveal>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 90}>
                <SpotlightCard className="feature-card">
                  <span className="feature-card__icon">
                    <feature.icon aria-hidden="true" />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <span className="feature-card__link">
                    Tìm hiểu thêm <ArrowRight size={16} />
                  </span>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--product">
        <div className="container">
          <Reveal className="section-heading section-heading--center">
            <Badge variant="info">Một nền tảng, nhiều vai trò</Badge>
            <h2>
              Quan sát toàn bộ nhịp đập đô thị trong <em>một không gian</em>
            </h2>
            <p>
              Không gian riêng cho Công dân, Cán bộ và Quản trị viên, đồng bộ dữ liệu theo
              thời gian thực.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>

      <section className="section workflow-section">
        <div className="workflow-layout container">
          <Reveal className="workflow-intro">
            <Badge variant="success">Quy trình khép kín</Badge>
            <h2>Từ một bức ảnh đến một thay đổi có thể nhìn thấy</h2>
            <p>
              Mỗi báo cáo có mã tra cứu, dòng thời gian và mốc SLA rõ ràng. Không còn phản
              ánh bị bỏ quên giữa nhiều đầu mối.
            </p>
            <Link to="/register">
              <Button variant="dark">
                Bắt đầu báo cáo <ArrowRight aria-hidden="true" size={18} />
              </Button>
            </Link>
          </Reveal>
          <div className="workflow-list">
            {workflow.map((item, index) => (
              <Reveal className="workflow-item" delay={index * 90} key={item.number}>
                <span className="workflow-item__number">{item.number}</span>
                <span className="workflow-item__icon">
                  <item.icon aria-hidden="true" />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section impact-section" id="impact">
        <div className="container">
          <Reveal className="section-heading section-heading--center section-heading--light">
            <Badge> Tác động đo lường được </Badge>
            <h2>
              Minh bạch không chỉ là lời hứa,
              <br /> mà là những con số được cập nhật mỗi ngày
            </h2>
          </Reveal>
          <div className="impact-stats">
            <Reveal>
              <div>
                <strong>1.248</strong>
                <span>Báo cáo được tiếp nhận</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div>
                <strong>88.4%</strong>
                <span>Tỷ lệ giải quyết đúng hạn</span>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div>
                <strong>18h</strong>
                <span>Thời gian xử lý trung bình</span>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div>
                <strong>126</strong>
                <span>Phường/xã được kết nối</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <Reveal className="cta-card">
            <div className="cta-card__glow" />
            <div>
              <Badge>Cùng xây dựng thành phố tốt hơn</Badge>
              <h2>Một phản ánh nhỏ hôm nay có thể tạo ra thay đổi lớn ngày mai.</h2>
              <p>
                Bắt đầu trong chưa đầy 2 phút. Chụp ảnh, chọn vị trí và theo dõi kết quả
                ngay trên Civic Pulse.
              </p>
            </div>
            <div className="cta-card__actions">
              <Link to="/register">
                <Button size="lg" variant="light">
                  <Camera aria-hidden="true" size={18} /> Tạo báo cáo
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline-light">
                  Theo dõi báo cáo
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
