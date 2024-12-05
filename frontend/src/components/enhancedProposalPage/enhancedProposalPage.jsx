import styles from "./styles/enhancedProposalPage.module.scss";

const EnhancedProposalMessage = () => {
  const message = {
    _id: "666666666666666666666666",
    sender: "666666666666666666666666",
    proposal: {
      messageText: "I can redesign your website for $500",
      budget: 500,
      deadline: "2024-12-24",
    },
  };

  return (
    <div className={styles.wrapper}>
      {/* Status Badge */}
      <div className={styles.statusBadge}>
        <span className={styles.dot}></span>
        Active for 23h 45m
      </div>

      {/* Main Content */}
      <div className={styles.proposalMessage}>
        {/* Project Title */}
        <div className={styles.projectTitle}>
          <h3>Website Redesign Project</h3>
          <span className={styles.projectId}>#PRJ-2024-12</span>
        </div>

        {/* Message Content */}
        <p className={styles.messageText}>{message.text}</p>

        {/* Scope & Deliverables */}
        <div className={styles.scopeSection}>
          <h4>Scope & Deliverables</h4>
          <ul className={styles.deliverables}>
            <li>✓ Complete website redesign</li>
            <li>✓ Mobile-responsive layouts</li>
            <li>✓ Source files included</li>
          </ul>
        </div>

        {/* Timeline */}
        <div className={styles.timeline}>
          <div className={styles.milestone}>
            <span className={styles.date}>Dec 10</span>
            <span className={styles.label}>Project Start</span>
          </div>
          <div className={styles.milestone}>
            <span className={styles.date}>Dec 24</span>
            <span className={styles.label}>Final Delivery</span>
          </div>
        </div>

        {/* Payment Terms */}
        <div className={styles.paymentTerms}>
          <div className={styles.paymentSchedule}>
            <div className={styles.payment}>
              <span>50% Upfront</span>
              <span className={styles.amount}>$500</span>
            </div>
            <div className={styles.payment}>
              <span>50% On Completion</span>
              <span className={styles.amount}>$500</span>
            </div>
          </div>
          <div className={styles.totalAmount}>
            <span>Total</span>
            <span className={styles.amount}>$1,000</span>
          </div>
        </div>

        {/* Additional Terms */}
        <div className={styles.terms}>
          <div className={styles.term}>
            <span className={styles.icon}>🔄</span>
            <span>3 rounds of revisions</span>
          </div>
          <div className={styles.term}>
            <span className={styles.icon}>📝</span>
            <span>Contract included</span>
          </div>
          <div className={styles.term}>
            <span className={styles.icon}>💬</span>
            <span>Weekly progress updates</span>
          </div>
        </div>

        {/* Attachments */}
        <div className={styles.attachments}>
          <div className={styles.file}>
            <span className={styles.fileIcon}>📄</span>
            <span>Project Brief.pdf</span>
            <span className={styles.fileSize}>2.3 MB</span>
          </div>
          <div className={styles.file}>
            <span className={styles.fileIcon}>📊</span>
            <span>Timeline.xlsx</span>
            <span className={styles.fileSize}>1.1 MB</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonsContainer}>
        <button className={styles.secondary}>Download Proposal</button>
        <button className={styles.counterOffer}>Request Changes</button>
        <button className={styles.accept}>Accept & Pay Deposit</button>
      </div>

      {/* Footer Info */}
      <div className={styles.footer}>
        <div className={styles.validUntil}>
          <span className={styles.icon}>⏳</span>
          Offer valid until Dec 7, 2024
        </div>
        <div className={styles.support}>
          Questions? <a href="#">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProposalMessage;
